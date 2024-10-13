import { NextFunction, Request, Response } from 'express'
import careerService from '../services/careerService'
import { Types } from 'mongoose'

const careerController = {
    addCareer: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { name, image, introduction } = req.body

            if (!name) {
                return res.status(400).json({ message: 'Career name is required.' })
            }

            const newCareer = await careerService.addCareer({ name, image, introduction })

            return res.status(200).json(newCareer)
        } catch (error: unknown) {
            next(error)
        }
    },
    getListCareer: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const newCareer = await careerService.getListCareer()

            return res.status(200).json(newCareer)
        } catch (error: unknown) {
            next(error)
        }
    },
    getCareerById: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params

            if (!id) {
                return res.status(400).json({ message: 'Career ID is required.' })
            }
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid career ID format.' })
            }

            const newCareer = await careerService.getCareerById(new Types.ObjectId(id))

            return res.status(200).json(newCareer)
        } catch (error: unknown) {
            next(error)
        }
    },
}

export default careerController
