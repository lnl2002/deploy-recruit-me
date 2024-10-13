import { NextFunction, Request, Response } from 'express'
import cvService from '../services/cvService'

const cvController = {
    getListCV: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const listCV = await cvService.getListCV()
            return res.json(listCV)
        } catch (error) {
            next(error)
        }
    },
}

export default cvController
