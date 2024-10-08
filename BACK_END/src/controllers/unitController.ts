import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import locationService from '../services/locationService'
import unitService from '../services/unitService'

const unitController = {
    getUnitList: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const listUnit = await unitService.getListUnit()
            return res.status(200).json(listUnit)
        } catch (error: unknown) {
            next(error)
        }
    },
    getUnitById: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params

            if (Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid unit ID format' })
            }

            const listUnit = await unitService.getUnitById(new Types.ObjectId(id))
            return res.status(200).json(listUnit)
        } catch (error: unknown) {
            next(error)
        }
    },
    addUnit: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { name, image, introduction, location } = req.body

            if (!name) {
                return res.status(400).json({ message: 'Name is required' })
            }

            if (!Types.ObjectId.isValid(location)) {
                return res.status(400).json({ message: 'Invalid location ID format' })
            }

            const locationResult = await locationService.getLocationById(new Types.ObjectId(location))
            if (!locationResult) {
                return res.status(404).json({ message: 'Location not found' })
            }

            const listUnit = await unitService.addUnit({
                name: name,
                image: image,
                introduction: introduction,
                location: location,
            })
            return res.status(200).json(listUnit)
        } catch (error: unknown) {
            next(error)
        }
    },
}

export default unitController
