import { NextFunction, Request, Response } from 'express'
import { IMeetingApproveStatus, IParticipantStatus } from '../models/meetingRoomModel'
import meetingService from '../services/meetingRoom'
import mongoose from 'mongoose'
import { FRONTEND_URL_CANDIDATE_HOME } from '../utils/env'
import {v4 as uuid} from 'uuid'

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
    createMeetingRoom: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { participantIds, timeStart } = req.body

        if (!participantIds || !timeStart ) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        if(participantIds.length < 2) {
            return res.status(400).json({ message: 'participantIds need more than or equal 2' })
        }

        if (isNaN(Date.parse(timeStart))) {
            return res.status(400).json({ message: 'Invalid timeStart format, must be a valid date-time' });
        }

        try {
            const participants = (participantIds as Array<string>).map(participantId => {
                return {
                    participant: new mongoose.Types.ObjectId(participantId),
                    status: IMeetingApproveStatus.PENDING
                }
            }) as IParticipantStatus[];

            const url = `${FRONTEND_URL_CANDIDATE_HOME}/meeting/${uuid()}`
            const schedules = await meetingService.createMeetingRoom({
                url,
                timeStart,
                participants
            })

            return res.status(200).json(schedules)
        } catch (error) {
            next(error)
        }
    },
}

export default meetingController
