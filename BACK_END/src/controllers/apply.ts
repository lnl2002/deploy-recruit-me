import { NextFunction, Request, Response } from 'express'
import mongoose, { Types } from 'mongoose'
import CVStatus from '../models/cvStatusModel'
import applyService from '../services/apply'

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
