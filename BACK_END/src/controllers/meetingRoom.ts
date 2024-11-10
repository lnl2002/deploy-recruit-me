import { NextFunction, Request, Response } from 'express'
import { IMeetingApproveStatus, IParticipantStatus } from '../models/meetingRoomModel'
import meetingService from '../services/meetingRoom'
import mongoose, { isValidObjectId } from 'mongoose'
import { FRONTEND_URL_CANDIDATE_HOME } from '../utils/env'
import { v4 as uuid } from 'uuid'

const meetingController = {
    updateMeetingStatus: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { meetingRoomId, participantId, status, title } = req.body

        console.log({ title })

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

        if (!mongoose.Types.ObjectId.isValid(interviewerId as string)) {
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
        const { participantIds, timeStart, timeEnd, applyId } = req.body

        if (!participantIds || !timeStart) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        if (participantIds.length < 2) {
            return res.status(400).json({ message: 'participantIds need more than or equal 2' })
        }

        if (!isValidObjectId(applyId)) {
            return res.status(400).json({ message: 'Invalid applyId' })
        }

        if (isNaN(Date.parse(timeStart)) || isNaN(Date.parse(timeEnd))) {
            return res.status(400).json({ message: 'Invalid time format, must be a valid date-time' })
        }

        try {
            const participants = (participantIds as Array<string>).map((participantId) => {
                return {
                    participant: new mongoose.Types.ObjectId(participantId),
                    status: IMeetingApproveStatus.PENDING,
                }
            }) as IParticipantStatus[]

            const url = `${FRONTEND_URL_CANDIDATE_HOME}/meeting/${uuid()}`
            const schedules = await meetingService.createMeetingRoom({
                url,
                timeStart,
                timeEnd,
                participants,
                applyId,
            })

            if (
                (
                    schedules as {
                        isError: boolean
                        message: string
                    }
                )?.isError
            ) {
                res.status(400).json(schedules)
                return
            }

            return res.status(200).json(schedules)
        } catch (error) {
            next(error)
        }
    },
    getListCandidates: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { sortOrder, statusFilter, page, limit, jobId } = req.query

            const userId = req?.user?._id

            if (!userId) {
                throw new Error('UNAUTHORIZED')
            }

            const data = await meetingService.getCandidateList({
                sortOrder: sortOrder as 'asc' | 'desc' | undefined,
                statusFilter: statusFilter as string | undefined,
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                userId,
                jobId: jobId?.toString() as string,
            })

            return res.status(200).json(data)
        } catch (error) {
            next(error)
        }
    },
    getMeetingRoomByUrl: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { url } = req.query
            if (!url) {
                return res.status(400).json({ message: 'Meeting URL is required' })
            }
            const meetingRoom = await meetingService.getMeetingRoom(url as string)
            if (!meetingRoom) {
                return res.status(404).json({ message: 'Meeting room not found' })
            }
            return res.status(200).json(meetingRoom)
        } catch (error) {
            next(error)
        }
    },
}

export default meetingController
