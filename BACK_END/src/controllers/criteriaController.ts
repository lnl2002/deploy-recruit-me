import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import criteriaService from '../services/criteriaService'

const criteriaController = {
    getListCriteria: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { career } = req.query
            let filterQuery: any = {}
            if (career) {
                if (!mongoose.Types.ObjectId.isValid(career as string)) {
                    return res.status(400).json({ message: 'Invalid career ID format' })
                }
                filterQuery.career = new mongoose.Types.ObjectId(career as string)
            }
            const listCriteria = await criteriaService.getListCriteria(filterQuery)
            return res.json(listCriteria)
        } catch (error) {
            next(error)
        }
    },
}

export default criteriaController
