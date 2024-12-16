import { NextFunction, Request, Response } from 'express'
import { IMeetingApproveStatus, IParticipantStatus } from '../models/meetingRoomModel'
import meetingService from '../services/meetingRoom'
import mongoose, { isValidObjectId } from 'mongoose'
import { FRONTEND_URL_CANDIDATE_HOME } from '../utils/env'
import { v4 as uuid } from 'uuid'
import accountService from '../services/accountService'
import { mailService } from '../services/mailServices/mailService'
import Apply from '../models/applyModel'

const meetingController = {
    updateMeetingStatus: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { meetingRoomId, status, title, declineReason } = req.body
        const participantId = new mongoose.Types.ObjectId(req.user._id)
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
                declineReason: declineReason,
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

            const apply = await Apply.findById(applyId)

            const { accounts: listAccount } = await accountService.getAccountList('', { _id: { $in: participantIds } })
            const listEmail = listAccount?.map((account) => account.email)

            const body = `
                <div style="padding: 20px; font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <h2 style="color: #2b579a; margin-bottom: 20px;">Your Meeting Room is Ready</h2>
                    <p style="margin-bottom: 20px;">Dear Participants,</p>
                    <p style="margin-bottom: 20px;">
                        A meeting room has been successfully created for your scheduled session. Below are the details:
                    </p>
                    <ul style="list-style-type: none; padding: 0; margin-bottom: 20px;">
                        <li style="margin-bottom: 10px;">
                            <strong>Meeting Link:</strong>
                            <a href="${url}" style="color: #1d70b8; text-decoration: none;">Join Meeting</a>
                        </li>
                        <li style="margin-bottom: 10px;">
                            <strong>Start Time:</strong> ${new Date(timeStart).toLocaleString()}
                        </li>
                        <li style="margin-bottom: 10px;">
                            <strong>End Time:</strong> ${new Date(timeEnd).toLocaleString()}
                        </li>
                    </ul>
                    <p style="margin-bottom: 20px;">
                        Please ensure you join the meeting on time using the link above. If you have any questions or concerns, feel free to reach out to us.
                    </p>
                    <p style="font-weight: 700; margin-bottom: 20px; font-size: 16px;">Please accept the interview invitation to start the meeting <a style="color: #1d70b8; text-decoration: none;" href="${FRONTEND_URL_CANDIDATE_HOME}/job-details?id=${apply?.job ?? ''}">job detail</a>. If you do not accept within 1 day, your CV will be eliminated.</p>
                    <p style="margin-top: 20px; color: #555;">
                        Best regards,<br />
                        <strong style="color: #2b579a;">RecruitMe Team</strong>
                    </p>
                </div>
            `

            mailService.sendMailBase({
                sendTo: listEmail,
                subject: 'Meeting Room is Created!',
                body: body,
            })

            return res.status(200).json(schedules)
        } catch (error) {
            next(error)
        }
    },
    updateMeetingRoom: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
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

            const schedules = await meetingService.updateSchedule({
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
            const { sortOrder, statusFilter, page, limit, jobId, sortField } = req.query

            const userId = req?.user?._id

            if (!userId) {
                throw new Error('UNAUTHORIZED')
            }

            let sort = 'createdAt'
            if (['timeStart', 'createdAt', 'apply.cvScore.averageScore'].includes(sortField?.toString())) {
                sort = sortField.toString()
            }

            const data = await meetingService.getCandidateList({
                sortField: sort as string,
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

    getMeetingRoomByApplyId: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { applyId } = req.params

        if (!isValidObjectId(applyId)) {
            return res.status(400).json({ message: 'Invalid applyId' })
        }

        try {
            const meetingRoom = await meetingService.getMeetingRoomByApplyId(applyId)

            if (!meetingRoom) {
                return res.status(404).json({ message: 'Meeting room not found' })
            }

            return res.status(200).json(meetingRoom)
        } catch (error) {
            next(error)
        }
    },

    getMeetingRoomsByJobId: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { jobId } = req.params

        if (!isValidObjectId(jobId)) {
            return res.status(400).json({ message: 'Invalid applyId' })
        }

        try {
            const meetingRooms = await meetingService.getMeetingsRoomByJobId(jobId)

            if (!meetingRooms) {
                return res.status(404).json({ message: 'Meeting room not found' })
            }

            return res.status(200).json(meetingRooms)
        } catch (error) {
            next(error)
        }
    },

    getCandidateRejectReason: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { applyId } = req.query

        if (!isValidObjectId(applyId)) {
            return res.status(400).json({ message: 'Invalid applyId' })
        }

        try {
            const reason = await meetingService.getCandidateRejectReason(applyId.toString())

            return res.status(200).json({
                reason: reason,
            })
        } catch (error) {
            next(error)
        }
    },

    addParticipant: async (req: Request, res: Response): Promise<void> => {
        try {
            const { participantId, meetingRoomId } = req.body

            const updatedMeetingRoom = await meetingService.addParticipant(meetingRoomId, participantId.toString())
            res.status(200).json(updatedMeetingRoom)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            res.status(400).json({ message: error.message })
        }
    },

    removeParticipant: async (req: Request, res: Response): Promise<void> => {
        try {
            const { participantId, meetingRoomId } = req.body

            const updatedMeetingRoom = await meetingService.removeParticipant(meetingRoomId, participantId.toString())
            res.status(200).json({ message: 'Participant removed successfully', data: updatedMeetingRoom })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            res.status(400).json({ message: error.message })
        }
    },
}

export default meetingController
