import { NextFunction, Request, Response } from 'express'
import roleService from '../services/roleService'
import { Types } from 'mongoose'

const roleController = {
    addRole: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { roleName } = req.body
            if (!roleName) {
                return res.status(400).json({ message: 'Role name is required' })
            }
            const newRole = await roleService.addRole({ roleName: roleName })
            return res.status(201).json(newRole)
        } catch (error: unknown) {
            next(error)
        }
    },

    getListRole: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const newRole = await roleService.getListRole()
            return res.status(200).json(newRole)
        } catch (error: unknown) {
            next(error)
        }
    },
    getRoleById: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid role ID format' })
            }

            const newRole = await roleService.getRoleById(new Types.ObjectId(id))
            return res.status(200).json(newRole)
        } catch (error: unknown) {
            next(error)
        }
    },
}

export default roleController
