/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose'
import MeetingRoom, { IMeetingApproveStatus, IMeetingRoom, IParticipantStatus } from '../models/meetingRoomModel'
import Account, { IAccount } from '../models/accountModel'
import Role, { IRole } from '../models/roleModel'
import CVStatus from '../models/cvStatusModel'
import Apply, { IApply } from '../models/applyModel'
import { formatDateTime, truncateToMinutes } from '../utils/common'
import { sendMessageToQueue } from '../configs/aws-queue'
import { S3_QUEUE_URL } from '../utils/env'
import { mailService } from './mailServices/mailService'
import { ICV } from '../models/cvModel'
import { IJob } from '../models/jobModel'

interface UpdateMeetingStatusInput {
    meetingRoomId: mongoose.Types.ObjectId
    participantId: mongoose.Types.ObjectId
    status: IMeetingApproveStatus
    declineReason?: string
}

interface InterviewScheduleParams {
    interviewerId: string
    startTime: Date
    endTime: Date
}

const meetingService = {
    updateMeetingStatus: async ({
        meetingRoomId,
        participantId,
        status,
        declineReason,
    }: UpdateMeetingStatusInput): Promise<void> => {
        // Tìm meeting room
        const meetingRoom = await MeetingRoom.findById(meetingRoomId)

        if (!meetingRoom) {
            throw new Error('Meeting Room not found')
        }

        // Check user tồn tại
        const user = await Account.findById(participantId).populate('role')
        if (!user) {
            throw new Error('User not found')
        }

        // Tìm participant cần cập nhật
        const participant = meetingRoom.participants.find((p) => p.participant.toString() === participantId.toString())

        if (!participant) {
            throw new Error('Participant not found in meeting room: ' + participantId)
        }

        participant.status = status
        if (declineReason && status == IMeetingApproveStatus.REJECTED) {
            participant.declineReason = declineReason
        }

        if (status === IMeetingApproveStatus.REJECTED && (user.role as IRole).roleName === 'CANDIDATE') {
            meetingRoom.rejectCount += 1

            if (meetingRoom.rejectCount >= 3) {
                const cvStatus = await CVStatus.findOne({
                    name: 'Rejected',
                })

                const apply = await Apply.findByIdAndUpdate(
                    meetingRoom.apply,
                    {
                        status: cvStatus._id,
                    },
                    { new: true },
                ).populate('cv job')

                const firstName = (apply?.cv as ICV)?.firstName || ''
                const lastName = (apply?.cv as ICV)?.lastName || ''
                const jobTitle = (apply?.job as IJob)?.title || ''

                mailService.sendMailBase({
                    sendTo: [user.email],
                    subject: 'Application Status Update',
                    body: `
                     <div style="padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                        <h2>Application Status Update</h2>
                        <p>Dear ${firstName} ${lastName},</p>
                        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>RecruitMe</strong>.</p>
                        <p>We regret to inform you that your application has been rejected. This decision was made because you declined the interview schedule more than three times. We understand that there may be valid reasons for not attending the interview, but our policy requires a commitment to the interview schedule during the recruitment process.</p>
                        <p>We appreciate your interest in <strong>RecruitMe</strong> and hope to have the opportunity to work with you in the future.</p>
                        <p>Wishing you all the best in your future endeavors.</p>
                        <p>Sincerely,<br>
                        RecruitMe<br>
                        recruitme@gmail.com</p>
                    </div>
                    <div style="margin-top: 20px; font-size: 0.9em; color: #666;">
                        <p>This is an automated message. Please do not reply.</p>
                    </div>
                    `,
                })
                console.log(`Candidate ${participantId} CV has been rejected due to multiple rejections.`)
            }
        }

        await meetingRoom.save()
    },
    getInterviewSchedules: async ({
        interviewerId,
        startTime,
        endTime,
    }: InterviewScheduleParams): Promise<IMeetingRoom[]> => {
        if (!interviewerId || !startTime || !endTime) {
            return []
        }

        if (startTime > endTime) {
            return []
        }

        const schedules = await MeetingRoom.find({
            participants: {
                $elemMatch: { participant: interviewerId },
            },
            timeStart: {
                $gte: startTime,
                $lte: endTime,
            },
        })

        return schedules
    },
    createMeetingRoom: async ({
        url,
        participants,
        timeStart,
        timeEnd,
        applyId,
    }: {
        url: string
        participants: IParticipantStatus[]
        timeStart: Date
        timeEnd: Date
        applyId: string
    }): Promise<
        | IMeetingRoom
        | {
              isError: boolean
              message: string
          }
    > => {
        if (participants.length <= 0) {
            return {
                isError: true,
                message: 'Participants are required.',
            }
        }

        if (timeStart > timeEnd) {
            return {
                isError: true,
                message: 'Invalid time range.',
            }
        }

        for (let index = 0; index < participants.length; index++) {
            const participant = participants[index]
            if (!['pending', 'approved', 'rejected'].includes(participant.status)) {
                return {
                    isError: true,
                    message: 'Invalid participant status found.',
                }
            }

            if (participant.status !== 'rejected' && !!participant.declineReason) {
                return {
                    isError: true,
                    message: 'Decline reason should only be provided for declined status.',
                }
            }
        }

        // Lấy danh sách participant IDs
        const participantIds = participants.map((p) => p.participant.toString())

        // Tìm tất cả các phòng họp trùng thời gian có thể xảy ra xung đột
        const overlappingMeetings = await MeetingRoom.find({
            $or: [
                {
                    timeStart: { $lte: timeEnd },
                    timeEnd: { $gte: timeStart },
                },
            ],
        })

        // Kiểm tra xem có bất kỳ participant nào trong các phòng họp trùng
        for (const meeting of overlappingMeetings) {
            const meetingParticipantIds = meeting.participants.map((p) => p.participant.toString())

            // Nếu có participant trùng lặp, ném lỗi
            if (participantIds.some((id) => meetingParticipantIds.includes(id))) {
                return {
                    isError: true,
                    message: 'One or more participants have a conflicting meeting schedule.',
                }
            }
        }

        const newMeetingRoom = new MeetingRoom({
            url,
            participants,
            timeStart,
            rejectCount: 0,
            isActive: false,
            timeEnd,
            apply: applyId,
        })
        return await newMeetingRoom.save()
    },
    updateSchedule: async ({
        applyId,
        participants,
        timeStart,
        timeEnd,
    }: {
        applyId: string
        participants: IParticipantStatus[]
        timeStart: Date
        timeEnd: Date
    }): Promise<IMeetingRoom | { isError: boolean; message: string }> => {
        // Kiểm tra input giống như trong hàm createMeetingRoom
        if (participants.length <= 0) {
            return {
                isError: true,
                message: 'Participants are required.',
            }
        }

        if (timeStart > timeEnd) {
            return {
                isError: true,
                message: 'Invalid time range.',
            }
        }

        for (let index = 0; index < participants.length; index++) {
            const participant = participants[index]
            if (!['pending', 'approved', 'rejected'].includes(participant.status)) {
                return {
                    isError: true,
                    message: 'Invalid participant status found.',
                }
            }

            if (participant.status !== 'rejected' && !!participant.declineReason) {
                return {
                    isError: true,
                    message: 'Decline reason should only be provided for declined status.',
                }
            }
        }

        // Lấy danh sách participant IDs
        const participantIds = participants.map((p) => p.participant.toString())

        // Tìm tất cả các phòng họp trùng thời gian có thể xảy ra xung đột
        const overlappingMeetings = await MeetingRoom.find({
            $or: [
                {
                    timeStart: { $lte: timeEnd },
                    timeEnd: { $gte: timeStart },
                },
            ],
        })

        // Kiểm tra xem có bất kỳ participant nào trong các phòng họp trùng
        for (const meeting of overlappingMeetings) {
            if(meeting.apply.toString() === applyId) continue;
            const meetingParticipantIds = meeting.participants.map((p) => p.participant.toString())

            // Nếu có participant trùng lặp, ném lỗi
            if (participantIds.some((id) => meetingParticipantIds.includes(id))) {
                return {
                    isError: true,
                    message: 'One or more participants have a conflicting meeting schedule.',
                }
            }
        }

        // Cập nhật meeting room
        const updatedMeetingRoom = await MeetingRoom.findOneAndUpdate(
            {
                apply: applyId
            },
            {
                participants,
                timeStart,
                timeEnd,
            },
            { new: true }, // Trả về document đã được cập nhật
        )

        if (!updatedMeetingRoom) {
            return {
                isError: true,
                message: 'Meeting room not found.',
            }
        }

        return updatedMeetingRoom
    },
    getCandidateList: async ({
        sortOrder = 'asc',
        sortField = 'createdAt', // Default sort field
        statusFilter,
        page = 1,
        limit = 1,
        userId,
        jobId,
    }: {
        sortOrder?: 'asc' | 'desc'
        sortField?: 'timeStart' | 'createdAt' | 'apply.cvScore.averageScore' | string
        statusFilter?: string
        page?: number
        limit?: number
        userId: string
        jobId?: string
    }) => {
        try {
            const skip = (page - 1) * limit
            const sortDirection = sortOrder === 'asc' ? 1 : -1 // Convert to 1 or -1
            let statusId = null

            if (statusFilter) {
                const status = await CVStatus.findOne({ name: statusFilter })
                if (!status)
                    return {
                        total: 0,
                        page,
                        totalPages: 0,
                        data: [],
                    }
                statusId = status._id
            }

            const aggregatePipeline: any[] = [
                {
                    $match: {
                        'participants.participant': new mongoose.Types.ObjectId(userId),
                    },
                },
                {
                    $lookup: {
                        from: 'applies',
                        localField: 'apply',
                        foreignField: '_id',
                        as: 'applyDetails',
                    },
                },
                { $unwind: '$applyDetails' },
                ...(statusId ? [{ $match: { 'applyDetails.status': statusId } }] : []),
                {
                    $lookup: {
                        from: 'accounts',
                        localField: 'applyDetails.createdBy',
                        foreignField: '_id',
                        as: 'candidateDetails',
                    },
                },
                { $unwind: '$candidateDetails' },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'applyDetails.job',
                        foreignField: '_id',
                        as: 'jobDetails',
                    },
                },
                { $unwind: '$jobDetails' },
                ...(jobId ? [{ $match: { 'jobDetails._id': new mongoose.Types.ObjectId(jobId) } }] : []),
                {
                    $lookup: {
                        from: 'cvs',
                        localField: 'applyDetails.cv',
                        foreignField: '_id',
                        as: 'cvDetails',
                    },
                },
                { $unwind: '$cvDetails' },
                {
                    $lookup: {
                        from: 'cvstatuses',
                        localField: 'applyDetails.status',
                        foreignField: '_id',
                        as: 'statusDetails',
                    },
                },
                { $unwind: '$statusDetails' },
                {
                    $lookup: {
                        from: 'accounts',
                        localField: 'participants.participant',
                        foreignField: '_id',
                        as: 'participantsDetails',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        url: 1,
                        timeStart: 1, // Ensure timeStart is included
                        timeEnd: 1,
                        rejectCount: 1,
                        isActive: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        apply: '$applyDetails',
                        applyId: '$applyDetails._id',
                        candidate: {
                            _id: '$candidateDetails._id',
                            name: '$candidateDetails.name',
                            image: '$candidateDetails.image',
                            email: '$candidateDetails.email',
                        },
                        job: {
                            _id: '$jobDetails._id',
                            title: '$jobDetails.title',
                        },
                        cv: {
                            _id: '$cvDetails._id',
                            email: '$cvDetails.email',
                            lastName: '$cvDetails.lastName',
                            firstName: '$cvDetails.firstName',
                            gender: '$cvDetails.gender',
                            dob: '$cvDetails.dob',
                            phoneNumber: '$cvDetails.phoneNumber',
                            address: '$cvDetails.address',
                            url: '$cvDetails.url',
                        },
                        applyStatus: '$statusDetails',
                        parsedScore: {
                            $cond: {
                                if: { $not: ['$applyDetails.cvScore.averageScore'] },
                                then: null,
                                else: {
                                    $toDouble: {
                                        $arrayElemAt: [{ $split: ['$applyDetails.cvScore.averageScore', '/'] }, 0],
                                    },
                                },
                            },
                        },
                        participants: {
                            $map: {
                                input: '$participantsDetails',
                                as: 'pd',
                                in: {
                                    _id: '$$pd._id',
                                    email: '$$pd.email',
                                    name: '$$pd.name',
                                    role: '$$pd.role.roleName',
                                    image: '$$pd.image',
                                    scheduleStatus: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$participants',
                                                    as: 'p',
                                                    cond: { $eq: ['$$p.participant', '$$pd._id'] },
                                                },
                                            },
                                            0,
                                        ],
                                    } as any,
                                },
                            },
                        },
                    },
                },
                ...(sortField === 'apply.cvScore.averageScore'
                    ? [
                          {
                              $addFields: {
                                  hasScore: {
                                      $cond: {
                                          if: { $not: ['$parsedScore'] },
                                          then: 1, // Mark nulls
                                          else: 0, // Mark records with score
                                      },
                                  },
                              },
                          },
                          {
                              $sort: {
                                  hasScore: 1, // Prioritize records with scores (0 comes first)
                                  parsedScore: sortDirection,
                                  createdAt: 1, // Tie-breaker
                              },
                          },
                      ]
                    : [
                          {
                              $sort: {
                                  [sortField]: sortDirection,
                                  createdAt: 1, // Tie-breaker
                              },
                          },
                      ]),
                { $skip: skip },
                { $limit: limit },
            ]

            const meetings = await MeetingRoom.aggregate(aggregatePipeline)

            const totalMeetingPipeline = [
                { $match: { 'participants.participant': new mongoose.Types.ObjectId(userId) } },
                {
                    $lookup: {
                        from: 'applies',
                        localField: 'apply',
                        foreignField: '_id',
                        as: 'applyDetails',
                    },
                },
                { $unwind: '$applyDetails' },
                ...(statusId ? [{ $match: { 'applyDetails.status': statusId } }] : []),
                {
                    $lookup: {
                        from: 'accounts',
                        localField: 'applyDetails.createdBy',
                        foreignField: '_id',
                        as: 'candidateDetails',
                    },
                },
                { $unwind: '$candidateDetails' },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'applyDetails.job',
                        foreignField: '_id',
                        as: 'jobDetails',
                    },
                },
                { $unwind: '$jobDetails' },
                ...(jobId ? [{ $match: { 'jobDetails._id': new mongoose.Types.ObjectId(jobId) } }] : []),
                {
                    $lookup: {
                        from: 'cvs',
                        localField: 'applyDetails.cv',
                        foreignField: '_id',
                        as: 'cvDetails',
                    },
                },
                { $unwind: '$cvDetails' },
                { $count: 'total' },
            ]

            const totalMeeting = await MeetingRoom.aggregate(totalMeetingPipeline)

            return {
                total: totalMeeting[0]?.total || 0,
                page,
                totalPages: Math.ceil((totalMeeting[0]?.total || 0) / limit),
                data: meetings,
            }
        } catch (error) {
            console.error('Error fetching candidate list:', error)
            throw error
        }
    },

    getMeetingRoom: async (url: string): Promise<IMeetingRoom> => {
        return await MeetingRoom.findOne({ url: url })
    },
    getMeetingRoomByApplyId: async (applyId: string): Promise<IMeetingRoom> => {
        return await MeetingRoom.findOne({ apply: applyId })
    },

    getMeetingsRoomByJobId: async (jobId: string): Promise<IMeetingRoom[] | null> => {
        try {
            // First, find the apply documents that match the jobId
            const applies = await mongoose.model<IApply>('Apply').find({ job: jobId })

            if (!applies || applies.length === 0) {
                return null // No applies found for this jobId
            }

            // Extract the apply IDs
            const applyIds = applies.map((apply) => apply._id)

            // Now, find the meeting rooms associated with those apply IDs
            const meetingRooms = await mongoose.model<IMeetingRoom>('MeetingRoom').find({ apply: { $in: applyIds } })

            return meetingRooms
        } catch (error) {
            console.error('Error finding meeting rooms by jobId:', error)
            return null
        }
    },

    getCandidateRejectReason: async (applyId: string) => {
        const role = await Role.findOne({ roleName: 'CANDIDATE' })
        if (!role) {
            console.error('Role CANDIDATE not found.')
            return null
        }

        const data = await MeetingRoom.findOne({ apply: applyId })
            .select('participants')
            .populate('participants.participant')

        if (!data) {
            console.error('No MeetingRoom found for the given applyId.')
            return null
        }

        // Lọc participants có role bằng role.id
        const filteredParticipants = data.participants.filter(
            (p) => p.participant && (p.participant as IAccount).role.toString() === role._id.toString(),
        )

        if (filteredParticipants.length <= 0) {
            console.error('No candidate found for the given applyId.')
            return null
        }

        return filteredParticipants[0].declineReason
    },

    addParticipant: async (meetingId: string, participantId: string) => {
        const meetingRoom = await MeetingRoom.findById(meetingId)
        if (!meetingRoom) {
            throw new Error('Meeting room not found')
        }
        // Check if participant already exists
        const participantExists = meetingRoom.participants.some(
            (p: IParticipantStatus) => p.participant.toString() === participantId.toString(),
        )
        if (participantExists) {
            throw new Error('Participant already exists in the meeting room')
        }

        // Add participant with default status 'pending'
        meetingRoom.participants.push({
            participant: new mongoose.Types.ObjectId(participantId),
            status: IMeetingApproveStatus.PENDING,
        })

        await meetingRoom.save()
        return meetingRoom
    },

    removeParticipant: async (meetingRoomId: string, participantId: string): Promise<IMeetingRoom | null> => {
        const meetingRoom = await MeetingRoom.findById(meetingRoomId)
        if (!meetingRoom) {
            throw new Error('Meeting room not found')
        }

        // Remove participant
        meetingRoom.participants = meetingRoom.participants.filter(
            (p: IParticipantStatus) => p.participant.toString() !== participantId.toString(),
        )

        await meetingRoom.save()
        return meetingRoom
    },

    //Check và gửi mail khi gần đến giờ họp 1 tiếng
    getMeetingRoomsOneHourFromNow: async () => {
        try {
            const now = truncateToMinutes(new Date())
            const oneHourFromNow = truncateToMinutes(new Date(now.getTime() + 60 * 60 * 1000))

            const rooms = await MeetingRoom.find({
                timeStart: oneHourFromNow,
            })
                .select('participants timeStart url')
                .populate({
                    path: 'participants.participant',
                    select: '_id email name',
                })

            const result = rooms.flatMap((meeting) =>
                meeting.participants
                    .filter((participant) => participant.participant && (participant.participant as IAccount).email) // Lọc các participant có email
                    .map((participant) => ({
                        email: (participant.participant as IAccount).email,
                        url: meeting.url,
                        timeStart: meeting.timeStart,
                        name: (participant.participant as IAccount).name,
                    })),
            )

            //Send to queue
            result.forEach(async (user) => {
                const sendTo = user.email
                const subject = `Reminder: Upcoming Meeting at ${formatDateTime(user.timeStart.toISOString())}`
                const body = `Hi ${user.name},<br/>
                    <br/>
                    This is a friendly reminder for your upcoming meeting, scheduled as follows:<br/>

                    - Date and Time:  ${formatDateTime(user.timeStart.toISOString())}<br/>
                    - Location: ${user.url}<br/>

                    Please make sure to join on time and prepare any necessary materials (if required). If you're unable to attend, kindly notify the organizer at your earliest convenience.<br/><br/>

                    Support Contact:<br/>
                    If you have any questions or face issues regarding the meeting, feel free to contact: recruitme-me@google.com<br/>
                    <br/>
                    Looking forward to your participation!<br/>
                    <br/>
                    Best regards,<br/>
                    RecruitMe<br/>
                    `
                await sendMessageToQueue(
                    S3_QUEUE_URL,
                    JSON.stringify({
                        sendTo: sendTo,
                        subject: subject,
                        body: body,
                    }),
                    'meeting-email-group',
                )
            })
        } catch (error) {
            console.error('Error fetching meeting rooms 1 hour from now:', error)
        }
    },

    //Check và gửi mail khi gần đến giờ họp 5 phút
    getMeetingRoomsFiveMinutesFromNow: async () => {
        try {
            const now = new Date()
            const fiveMinutesFromNow = truncateToMinutes(new Date(now.getTime() + 5 * 60 * 1000))

            const rooms = await MeetingRoom.find({
                timeStart: fiveMinutesFromNow,
            })

            const result = rooms.flatMap((meeting) =>
                meeting.participants
                    .filter((participant) => participant.participant && (participant.participant as IAccount).email) // Lọc các participant có email
                    .map((participant) => ({
                        email: (participant.participant as IAccount).email,
                        url: meeting.url,
                        timeStart: meeting.timeStart,
                        name: (participant.participant as IAccount).name,
                    })),
            )

            //Send to queue
            result.forEach(async (user) => {
                const sendTo = user.email
                const subject = `Reminder: Meeting starts in 5 minutes!`
                const body = `Hi ${user.name},<br/>
                    <br/>
                    This is a friendly reminder for your upcoming meeting, scheduled as follows:<br/>

                    - Date and Time:  ${user.timeStart.toISOString()}<br/>
                    - Location: ${user.url}<br/>

                    Please make sure to join on time and prepare any necessary materials (if required). If you're unable to attend, kindly notify the organizer at your earliest convenience.<br/><br/>

                    Support Contact:<br/>
                    If you have any questions or face issues regarding the meeting, feel free to contact: recruitme-me@google.com<br/>
                    <br/>
                    Looking forward to your participation!<br/>
                    <br/>
                    Best regards,<br/>
                    RecruitMe<br/>
                    `
                await sendMessageToQueue(
                    S3_QUEUE_URL,
                    JSON.stringify({
                        sendTo: sendTo,
                        subject: subject,
                        body: body,
                    }),
                    'meeting-email-group',
                )
            })

            return rooms
        } catch (error) {
            console.error('Error fetching meeting rooms 5 minutes range:', error)
        }
    },

    //check nếu đến ngày họp mà không xác nhận lịch meeting sẽ chuyển về trạng thái reject
    getMeetingOverdue: async () => {
        try {
            const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD

            const roleCandidate = await Role.findOne({ roleName: 'CANDIDATE' })

            if (!roleCandidate) {
                console.error('Role CANDIDATE not found')
                return []
            }

            const overdueMeetings = await MeetingRoom.aggregate([
                // Match meetings with today's date
                {
                    $match: {
                        $expr: {
                            $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$timeStart' } }, today],
                        },
                    },
                },
                // Unwind participants array
                { $unwind: '$participants' },
                // Lookup participant details from Account
                {
                    $lookup: {
                        from: 'accounts', // MongoDB collection name for Account
                        localField: 'participants.participant',
                        foreignField: '_id',
                        as: 'participantDetails',
                    },
                },
                // Flatten the participantDetails array
                { $unwind: '$participantDetails' },
                // Match participants with role CANDIDATE and status pending
                {
                    $match: {
                        'participantDetails.role': roleCandidate._id,
                        'participants.status': 'pending',
                    },
                },
                // Re-group by meeting room while keeping detailed participant info
                {
                    $group: {
                        _id: '$_id',
                        url: { $first: '$url' },
                        timeStart: { $first: '$timeStart' },
                        timeEnd: { $first: '$timeEnd' },
                        participants: {
                            $push: {
                                participantDetails: '$participantDetails',
                                status: '$participants.status',
                            },
                        },
                        rejectCount: { $first: '$rejectCount' },
                        isActive: { $first: '$isActive' },
                        apply: { $first: '$apply' },
                    },
                },
            ])

            return overdueMeetings
        } catch (error) {
            console.error('Error in getMeetingOverdue:', error)
            return []
        }
    },
}

export default meetingService
