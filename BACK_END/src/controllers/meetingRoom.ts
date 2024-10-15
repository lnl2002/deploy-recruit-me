import { NextFunction, Request, Response } from 'express'
import { IMeetingApproveStatus } from '../models/meetingRoomModel'
import meetingService from '../services/meetingRoom'
import mongoose from 'mongoose'

const meetingController = {
    updateMeetingStatus: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { meetingRoomId, participantId, status } = req.body

        // Kiểm tra tính hợp lệ của dữ liệu đầu vào
        if (!meetingRoomId || !participantId || !status) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        // Kiểm tra nếu status không thuộc các giá trị trong enum
        if (!Object.values(IMeetingApproveStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }
        try {
            await meetingService.updateMeetingStatus({
                meetingRoomId: meetingRoomId,
                participantId: participantId,
                status: status as IMeetingApproveStatus,
            })

            return res.status(200).json({ message: 'Status updated successfully' })
        } catch (error) {
            next(error)
        }
    },
    getInterviewSchedules: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { interviewerId, startTime, endTime } = req.query

        if (!interviewerId || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        if (!mongoose.Types.ObjectId.isValid(interviewerId as string) ) {
            return res.status(400).json({ message: 'Invalid ID' })
        }

        try {
            const start = new Date(startTime as string)
            const end = new Date(endTime as string)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)

            if (end <= start) {
                return res.status(400).json({ message: 'endTime must be later than startTime' })
            }

            const schedules = await meetingService.getInterviewSchedules({
                interviewerId: interviewerId as string,
                startTime: start,
                endTime: end,
            })

            return res.status(200).json(schedules)
        } catch (error) {
            next(error)
        }
    },
}

export default meetingController
