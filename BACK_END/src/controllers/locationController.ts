import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import locationService from '../services/locationService'

const locationController = {
    addLocation: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { city } = req.body
            if (!city) {
                return res.status(400).json({ message: 'City is required' })
            }

            const newLocation = await locationService.addLocation({ city })
            return res.status(201).json(newLocation)
        } catch (error: unknown) {
            next(error)
        }
    },
    getLocationById: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ message: 'City is required' })
            }

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid city ID format' })
            }

            const location = await locationService.getLocationById(new Types.ObjectId(id))
            return res.status(200).json(location)
        } catch (error: unknown) {
            next(error)
        }
    },
    getListLocation: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const listLocation = await locationService.getListLocation()
            return res.status(200).json(listLocation)
        } catch (error: unknown) {
            next(error)
        }
    },
}

export default locationController
