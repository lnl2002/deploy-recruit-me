import mongoose from 'mongoose'
import MeetingRoom, { IMeetingApproveStatus, IMeetingRoom, IParticipantStatus } from '../models/meetingRoomModel'
import Account from '../models/accountModel'
import { IRole } from '../models/roleModel'

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
    }: {
        url: string,
        participants: IParticipantStatus[],
        timeStart: Date
    }): Promise<IMeetingRoom> => {
        const newMeetingRoom = new MeetingRoom({
            url,
            participants,
            timeStart,
            rejectCount: 0,
            isActive: false,
        });
        return await newMeetingRoom.save();
    },
}

export default meetingService
