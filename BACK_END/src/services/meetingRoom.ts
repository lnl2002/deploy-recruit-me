import mongoose from 'mongoose'
import MeetingRoom, { IMeetingApproveStatus, IMeetingRoom, IParticipantStatus } from '../models/meetingRoomModel'
import Account, { IAccount } from '../models/accountModel'
import Role, { IRole } from '../models/roleModel'
import CVStatus from '../models/cvStatusModel'
import { IApply } from '../models/applyModel'

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
    getCandidateList: async ({
        sortOrder = 'asc',
        statusFilter,
        page = 1,
        limit = 1,
        userId,
        jobId,
    }: {
        sortOrder?: 'asc' | 'desc'
        statusFilter?: string
        page?: number
        limit?: number
        userId: string
        jobId: string
    }) => {
        try {
            const skip = (page - 1) * limit

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

            const aggregatePipeline = [
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
                        from: 'cvs', // reference the CV model
                        localField: 'applyDetails.cv', // field in apply that references CV
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
                        timeStart: 1,
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
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    } as any,
                                },
                            },
                        },
                    },
                },
                { $sort: { createdAt: sortOrder === 'asc' ? 1 : -1 } },
                { $skip: skip },
                { $limit: limit },
            ]

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const meetings = await MeetingRoom.aggregate(aggregatePipeline as any[])

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
        const filteredParticipants = data.participants.filter((p) =>  p.participant && ((p.participant as IAccount).role.toString() === role._id.toString()))

        if (filteredParticipants.length <= 0) {
            console.error('No candidate found for the given applyId.')
            return null
        }

        return filteredParticipants[0].declineReason
    },

    addParticipant: async (meetingId: string, participantId: string) => {
        const meetingRoom = await MeetingRoom.findById(meetingId);
        if (!meetingRoom) {
            throw new Error('Meeting room not found');
        }
        // Check if participant already exists
        const participantExists = meetingRoom.participants.some(
            (p: IParticipantStatus) => p.participant.toString() === participantId.toString()
        );
        if (participantExists) {
            throw new Error('Participant already exists in the meeting room');
        }

        // Add participant with default status 'pending'
        meetingRoom.participants.push({
            participant: new mongoose.Types.ObjectId(participantId),
            status: IMeetingApproveStatus.PENDING,
        });

        await meetingRoom.save();
        return meetingRoom;
    },

    removeParticipant: async (
        meetingRoomId: string,
        participantId: string
    ): Promise<IMeetingRoom | null> => {
        const meetingRoom = await MeetingRoom.findById(meetingRoomId);
        if (!meetingRoom) {
            throw new Error('Meeting room not found');
        }

        // Remove participant
        meetingRoom.participants = meetingRoom.participants.filter(
            (p: IParticipantStatus) => p.participant.toString() !== participantId.toString()
        );

        await meetingRoom.save();
        return meetingRoom;
    },
}

export default meetingService
