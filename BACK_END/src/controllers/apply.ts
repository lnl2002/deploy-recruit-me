import { NextFunction, Request, Response } from 'express'
import mongoose, { Types } from 'mongoose'
import CVStatus from '../models/cvStatusModel'
import applyService from '../services/apply'

const applyController = {
    updateApplyStatus: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { applyId, newStatusId } = req.body

        if (!mongoose.Types.ObjectId.isValid(applyId) || !mongoose.Types.ObjectId.isValid(newStatusId)) {
            res.status(400).json({ message: 'Invalid ID' })
            return
        }

        try {
            //check status exists
            const statusExists = await CVStatus.exists({ _id: newStatusId })
            if (!statusExists) {
                res.status(404).json({ message: 'Not found StatusId' })
                return
            }

            const updatedApply = await applyService.updateStatus({
                applyId,
                newStatusId,
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
}

export default applyController
