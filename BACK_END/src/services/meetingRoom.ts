import mongoose from 'mongoose'
import MeetingRoom, { IMeetingApproveStatus, IMeetingRoom, IParticipantStatus } from '../models/meetingRoomModel'
import Account from '../models/accountModel'
import { IRole } from '../models/roleModel'
import CVStatus from '../models/cvStatusModel'

interface UpdateMeetingStatusInput {
    meetingRoomId: mongoose.Types.ObjectId
    participantId: mongoose.Types.ObjectId
    status: IMeetingApproveStatus
}

interface InterviewScheduleParams {
    interviewerId: string
    startTime: Date
    endTime: Date
}

const meetingService = {
    updateMeetingStatus: async ({ meetingRoomId, participantId, status }: UpdateMeetingStatusInput): Promise<void> => {
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
            throw new Error('Participant not found in meeting room')
        }

        participant.status = status

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
        jobId
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

            const meetings = await MeetingRoom.aggregate(aggregatePipeline as any[])

            const totalMeeting = await MeetingRoom.aggregate([
                // Match on userId in participants
                { $match: { 'participants.participant': new mongoose.Types.ObjectId(userId) } },
                // Lookup for applyDetails to join applies collection
                {
                    $lookup: {
                        from: 'applies',
                        localField: 'apply',
                        foreignField: '_id',
                        as: 'applyDetails',
                    },
                },
                { $unwind: '$applyDetails' },
                // Nếu có statusFilter thì cần thêm vào pipeline để lọc theo status
                ...(statusFilter
                    ? [
                          // Lookup for statusDetails to join cvstatuses collection
                          {
                              $lookup: {
                                  from: 'cvstatuses',
                                  localField: 'applyDetails.status',
                                  foreignField: '_id',
                                  as: 'statusDetails',
                              },
                          },
                          { $unwind: '$statusDetails' },
                          // Match theo statusFilter
                          { $match: { 'statusDetails.name': statusFilter } },
                      ]
                    : []),
                // Final stage to count documents
                { $count: 'total' },
            ])

            return {
                total: totalMeeting[0]?.total || 0,
                page,
                totalPages: Math.ceil(totalMeeting[0]?.total || 0 / limit),
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
}

export default meetingService
