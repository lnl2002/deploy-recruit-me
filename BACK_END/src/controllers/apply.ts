import { NextFunction, Request, Response } from 'express'
import mongoose, { Types } from 'mongoose'
import CVStatus, { ICVStatus } from '../models/cvStatusModel'
import applyService from '../services/apply'
import { ICV } from '../models/cvModel'
import { mailService } from '../services/mailServices/mailService'
import Apply from '../models/applyModel'
import { IJob } from '../models/jobModel'

const applyController = {
    updateApplyStatus: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { applyId, newStatus } = req.body

        if (!mongoose.Types.ObjectId.isValid(applyId)) {
            res.status(400).json({ message: 'Invalid ID' })
            return
        }

        if (!newStatus) {
            res.status(400).json({ message: 'Invalid status' })
            return
        }

        try {
            //check status exists
            const statusExists = await CVStatus.exists({ name: newStatus })
            if (!statusExists) {
                res.status(404).json({ message: 'Not found status' })
                return
            }

            const updatedApply = await applyService.updateStatus({
                applyId,
                newStatusId: statusExists._id.toString(),
            })

            if (!updatedApply) {
                res.status(404).json({ message: 'Not found ApplyId' })
                return
            }

            if (newStatus === 'Rejected' || newStatus === 'Accepted') {
                const newApply = await Apply.findById(updatedApply._id).populate('job cv status')

                const firstName = (newApply?.cv as ICV)?.firstName || ''
                const email = (newApply?.cv as ICV)?.email || ''
                const lastName = (newApply?.cv as ICV)?.lastName || ''
                const jobTitle = (newApply?.job as IJob)?.title || ''
                const status = (newApply?.status as ICVStatus)?.name || ''

                mailService.sendMailBase({
                    sendTo: [email],
                    subject: 'RecruitMe Notification',
                    body: `
                   <div style="padding: 20px; font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #2b579a; margin-bottom: 20px;">RecruitMe - Application Status Update</h2>
                        <p>Dear ${firstName} ${lastName},</p>
                        <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>RecruitMe</strong>.</p>

                        ${
                            status === 'Accepted'
                                ? `<p style="margin-bottom: 20px;">
                                <strong style="color: black; font-size: 16px">Congratulations!</strong> We are excited to inform you that your application has been <strong style="color: green; font-size: 16px">Accepted</strong>.
                                Welcome to our team at RecruitMe! Our HR team will reach out to you shortly with further details regarding the next steps.
                            </p>`
                                : `<p style="margin-bottom: 20px;">
                                We regret to inform you that after careful consideration, your application has been <strong style="color: red; font-size: 16px">Rejected</strong>.
                                While this position might not have been the right fit, we encourage you to explore future opportunities with us.
                            </p>`
                        }

                        <p style="margin-bottom: 20px;">If you have any questions or need further clarification, please do not hesitate to contact us.</p>

                        <p style="color: #555;">
                            Best regards,<br />
                            <strong style="color: #2b579a;">RecruitMe Team</strong>
                        </p>
                    </div>
                `,
                })
            }

            res.status(200).json({ message: 'Success', data: updatedApply })
        } catch (error) {
            next(error)
        }
    },
    getApplyListByJob: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params

            if (!id) {
                return res.status(400).json({ message: 'Job ID is required.' })
            }

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid Job ID format.' })
            }

            const listApply = await applyService.getApplyListByJob(new Types.ObjectId(id))

            res.status(200).json(listApply)
        } catch (error) {
            next(error)
        }
    },
    getApplyListByInterviewManager: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { page, limit, sort } = req.params
            const userId = req?.user?._id || ''

            if (!userId) {
                return res.status(400).json({ message: 'UNAUTHORIZED' })
            }

            if (page && isNaN(parseInt(page, 10))) {
                return res.status(400).json({ message: 'BAD REQUEST' })
            }

            if (limit && isNaN(parseInt(page, 10))) {
                return res.status(400).json({ message: 'BAD REQUEST' })
            }

            if (sort && !['desc', 'asc'].includes(sort)) {
                return res.status(400).json({ message: 'sort must be desc or asc' })
            }

            const listApply = await applyService.getApplyListByInterviewManager({
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort,
                userId,
            })

            res.status(200).json(listApply)
        } catch (error) {
            next(error)
        }
    },
}

export default applyController
