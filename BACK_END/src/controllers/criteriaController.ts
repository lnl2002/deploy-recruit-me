import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import criteriaService from '../services/criteriaService'
import { ICriteriaDetails } from '../models/criteriaModel'

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
    addCriteria: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { name, basic, beginer, expert, intermediate, advanced } = req.body

            if (!name || !beginer || !basic || !intermediate || !advanced || !expert) {
                res.status(400).json({ message: 'All fields are required.' })
                return
            }

            const listCriteria = await criteriaService.addCriteria({
                name: name as string,
                basic: basic as ICriteriaDetails,
                beginer: beginer as ICriteriaDetails,
                expert: expert as ICriteriaDetails,
                intermediate: intermediate as ICriteriaDetails,
                advanced: advanced as ICriteriaDetails,
            })
            return res.json(listCriteria)
        } catch (error) {
            next(error)
        }
    },
}

export default criteriaController
