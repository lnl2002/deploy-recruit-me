import { Request, Response, NextFunction } from 'express'
import criteriasService from '../services/groupCriteriasService'
import { IGroupCriteria } from '../models/groupCriteriaModel'
import mongoose from 'mongoose'

export const groupCriteriaController = {
    addGroupCriteria: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, criterias, unit } = req.body

            // Validate request body
            if (!name || !criterias || !unit) {
                res.status(400).json({ message: 'Name, criterias, and unit are required.' })
                return
            }

            // Ensure `criterias` is an array
            if (!Array.isArray(criterias) || criterias.length === 0) {
                res.status(400).json({ message: 'Criterias must be a non-empty array of ObjectIds.' })
                return
            }

            const newCriterias = await criteriasService.addGroupsCriteria({
                name,
                criterias,
                unit,
            })

            res.status(201).json(newCriterias)
        } catch (error) {
            next(error) // Pass the error to error-handling middleware
        }
    },
    getGroupCriterias: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { unit, name } = req.query
            const query: any = {}

            if (unit) {
                if (!mongoose.Types.ObjectId.isValid(unit as string)) {
                    return res.status(400).json({ message: 'Invalid unit ID format' })
                }
                query.unit = new mongoose.Types.ObjectId(unit as string)
            }

            if (name) {
                query.name = { $regex: name, $options: 'i' }
            }

            const listCriteria = await criteriasService.getGroupsCriterias(query)
            res.status(200).json(listCriteria)
        } catch (error) {
            next(error) // Pass the error to error-handling middleware
        }
    },
    getGroupCriteria: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params // ID from URL params
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid or missing ID parameter' })
            }

            // 2. Call the service to fetch the group criteria by `id`
            const criteria = await criteriasService.getGroupsCriteria(new mongoose.Types.ObjectId(id))

            // 3. Validate that the result is valid and contains data
            if (!criteria) {
                return res.status(404).json({ message: 'No criteria found for the given ID' })
            }

            // 4. Return the result if everything is okay
            res.status(200).json(criteria)
        } catch (error) {
            next(error) // Pass the error to error-handling middleware
        }
    },
    updateGroupCriteria: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params // ID from URL params
            const { name, criterias, unit } = req.body // Fields to update

            if (!id) {
                res.status(400).json({ message: 'ID is required.' })
                return
            }

            // Validation checks (if needed)
            if (criterias && !Array.isArray(criterias)) {
                res.status(400).json({ message: '`criterias` must be an array of ObjectIds.' })
                return
            }

            // Prepare update data
            const updates: Partial<IGroupCriteria> = {
                ...(name && { name }),
                ...(criterias && { criterias }),
                ...(unit && { unit }),
            }

            // Call service to update
            const updatedGroupCriteria = await criteriasService.updateGroupCriteria(id, updates)

            if (!updatedGroupCriteria) {
                res.status(404).json({ message: 'GroupCriteria not found.' })
                return
            }

            res.status(200).json({ message: 'GroupCriteria updated successfully.', data: updatedGroupCriteria })
        } catch (error) {
            next(error) // Pass errors to middleware
        }
    },
}

export default groupCriteriaController
