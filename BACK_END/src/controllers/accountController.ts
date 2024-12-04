/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextFunction, Request, Response } from 'express'
import { IAccount, IAccoutStatus } from '../models/accountModel'
import accountService from '../services/accountService'
import { isValidObjectId } from 'mongoose'
import validator from 'validator';

const accountController = {
    getListAccounts: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { skip, limit, name, email, sort_by, order } = req.query

            const pageLimit = parseInt(limit as string, 10) || 10
            const pageSkip = parseInt(skip as string, 10) || 0

            // if (pageLimit <= pageSkip) {
            //     return res.status(400).json('Limit must be greater than skip')
            // }

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
                status: 'string',
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
    getInterviewerByUnit: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { unitId } = req.query
            if (!unitId) {
                res.status(400).json({
                    message: 'BAD REQUEST',
                })
            }

            const data = await accountService.getInterviewerByUnit(unitId.toString())
            return res.status(200).json(data)
        } catch (error) {
            next(error)
        }
    },

    updateStatus: async (req: Request, res: Response) => {
        try {
            const { accountId } = req.params
            const { status } = req.body

            if (!isValidObjectId(accountId)) {
                return res.status(400).json({
                    message: 'INVALID_ID',
                })
            }

            // Ensure the newStatus is a valid enum value
            if (!Object.values(IAccoutStatus).includes(status)) {
                return res.status(400).json({
                    message: 'INVALID_STATUS',
                })
            }

            // Call the service to update the status
            const updatedAccount = await accountService.updateStatus(accountId.toString(), status as IAccoutStatus)

            if (!updatedAccount) {
                return res.status(404).json({ message: 'Account not found.' })
            }

            return res.status(200).json({ message: 'Account status updated successfully.', data: updatedAccount })
        } catch (error: any) {
            return res.status(400).json({ message: error?.message || 'Failed to update account status.' })
        }
    },

    createAccount: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { name, email, role, unit } = req.body

            // Validate required fields
            if (!name || !email || !role) {
                return res.status(400).json({ message: 'Missing required fields: name, email, or role.' })
            }

            if(!isValidObjectId(role)){
                return res.status(400).json({ message: 'INVALID_OBJECTID' })
            }

            const sanitizedData = sanitizeAccountData({ name, email, role, unit });
            if (!validator.isEmail(sanitizedData.email)) {
                res.status(400).json({ message: 'INVALID_EMAIL' })
              }

            // Call service to create account
            const account = await accountService.createAccount({
                ...sanitizedData
            })

            return res.status(201).json({ message: 'Account created successfully.', data: account })
        } catch (error) {
            next(error)
        }
    },
}

const sanitizeAccountData = (accountData: Partial<IAccount>) => {
    return {
      name: validator.trim(accountData.name || ''),
      email: validator.normalizeEmail(accountData.email || '', { gmail_remove_dots: false }) || '',
      role: accountData.role,
      unit: accountData.unit,
    };
  };

export default accountController
