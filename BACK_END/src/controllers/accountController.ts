import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import { IAccount } from '../models/accountModel'
import accountService from '../services/accountService'

const accountController = {
    getListAccounts: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { skip, limit, name, email, sort_by, order } = req.query

            const pageLimit = parseInt(limit as string, 10) || 10
            const pageSkip = parseInt(skip as string, 10) || 0

            if (pageLimit <= pageSkip) {
                return res.status(400).json('Limit must be greater than skip')
            }

            const query: any = {
                limit: pageLimit,
                skip: pageSkip,
                ...req.query,
            }

            if (sort_by) {
                query.sort_field = sort_by as string
            }

            if (order) {
                query.order = order as 'asc' | 'desc'
            }

            // Define the field types for validation
            const fieldTypes: { [key in keyof Partial<IAccount>]?: 'string' | 'objectId' } = {
                name: 'string',
                email: 'string',
                googleId: 'string',
                cvs: 'objectId',
                role: 'objectId',
                unit: 'objectId',
            }

            // Filter and validate the query parameters based on field types
            const filteredQuery = Object.keys(query)
                .filter((key) => key in fieldTypes) // Only keep fields present in fieldTypes
                .reduce((obj, key) => {
                    const { Types } = require('mongoose')
                    const expectedType = fieldTypes[key as keyof Partial<IAccount>]
                    let value = query[key]

                    // Handle each field based on its expected type
                    if (expectedType === 'string') {
                        value = value.toString()
                    } else if (expectedType === 'objectId') {
                        if (!Types.ObjectId.isValid(value)) return obj
                        value = new Types.ObjectId(value)
                    }

                    obj[key] = value
                    return obj
                }, {} as any)

            // Apply filters for specific fields (e.g., name, email, role)
            if (name) {
                filteredQuery.name = { $regex: name, $options: 'i' } // Case-insensitive match
            }

            if (email) {
                filteredQuery.email = { $regex: email, $options: 'i' }
            }

            if (filteredQuery.cvs?.includes(',')) {
                const multiCvs = filteredQuery.cvs.split(',')
                filteredQuery.status = { $in: multiCvs }
            }

            const accounts = await accountService.getAccountList(query, filteredQuery)
            return res.json(accounts)
        } catch (error) {
            next(error)
        }
    },
}

export default accountController
