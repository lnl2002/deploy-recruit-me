import mongoose from 'mongoose'
import MeetingRoom, { IMeetingApproveStatus } from '../models/meetingRoomModel'
import Account from '../models/accountModel'
import { IRole } from '~/models/roleModel'

interface UpdateMeetingStatusInput {
    meetingRoomId: mongoose.Types.ObjectId
    participantId: mongoose.Types.ObjectId
    status: IMeetingApproveStatus
}

const meetingService = {
    updateMeetingStatus: async ({ meetingRoomId, participantId, status }: UpdateMeetingStatusInput): Promise<void> => {
        // Tìm meeting room
        const meetingRoom = await MeetingRoom.findById(meetingRoomId)

        if (!meetingRoom) {
            throw new Error('Meeting Room not found')
        }

        // Check user tồn tại
        const user = await Account.findById(participantId).populate('role');
        if(!user){
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
}

export default meetingService