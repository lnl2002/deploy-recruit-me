import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import jobService from '../services/jobService'
import accountService from '../services/accountService'
import unitService from '../services/unitService'
import careerService from '../services/careerService'
import { IRole } from '../models/roleModel'
import { IJob } from '../models/jobModel'

const jobController = {
    getJobDetail: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid job ID format' })
            }

            const job = await jobService.getJobById(new Types.ObjectId(id))

            if (!job) {
                return res.status(404).json({ message: 'Job not found' })
            }

            return res.json(job)
        } catch (error: unknown) {
            next(error)
        }
    },
    getJobList: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { skip, limit, title, sort_by, order, expiredDate } = req.query

            const pageLimit = parseInt(limit as string, 10) || 10
            const pageSkip = parseInt(skip as string, 10) || 0

            if (pageLimit <= pageSkip) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be greater than to skip',
                })
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

            const fieldTypes: { [key in keyof Partial<IJob>]?: 'string' | 'number' | 'boolean' | 'date' } = {
                title: 'string',
                introduction: 'string',
                description: 'string',
                minSalary: 'number',
                maxSalary: 'number',
                numberPerson: 'number',
                unit: 'string',
                career: 'string',
                account: 'string',
                location: 'string',
                interviewer: 'string',
                address: 'string',
                timestamp: 'date',
                expiredDate: 'date',
                isDelete: 'boolean',
                isActive: 'boolean',
                type: 'string',
            }

            // Lọc và xác thực các trường hợp hợp lệ
            const filteredQuery = Object.keys(query)
                .filter((key) => key in fieldTypes) // Chỉ giữ lại các trường hợp có trong fieldTypes
                .reduce((obj, key) => {
                    const expectedType = fieldTypes[key as keyof Partial<IJob>]
                    let value = query[key]

                    // Xử lý theo loại dữ liệu mong muốn
                    if (expectedType === 'number') {
                        value = parseInt(value, 10)
                        if (isNaN(value)) return obj // Bỏ qua nếu không phải số hợp lệ
                    } else if (expectedType === 'boolean') {
                        value = Boolean(value === 'true' || value === true)
                    } else if (expectedType === 'date') {
                        value = new Date(value)
                        if (isNaN(value.getTime())) return obj // Bỏ qua nếu không phải ngày hợp lệ
                    } else if (expectedType === 'string') {
                        value = value.toString()
                    }

                    // Thêm giá trị hợp lệ vào đối tượng query
                    obj[key] = value
                    return obj
                }, {} as any)

            if (expiredDate) {
                const currentDate = new Date()
                if (expiredDate == '1') filteredQuery.expiredDate = { $gte: currentDate }
                if (expiredDate == '-1') filteredQuery.expiredDate = { $lt: currentDate }
            }

            if (title) {
                filteredQuery.title = { $regex: title, $options: 'i' }
            }

            const jobs = await jobService.getListJobs(query, filteredQuery)

            return res.json(jobs)
        } catch (error: unknown) {
            next(error)
        }
    },
    getJobListByUser: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { skip, limit, title, sort_by, order, expiredDate } = req.query

            const { id } = req.params

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid Account ID format' })
            }

            const pageLimit = parseInt(limit as string, 10) || 10
            const pageSkip = parseInt(skip as string, 10) || 0

            if (pageLimit <= pageSkip) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be greater than to skip',
                })
            }

            if (pageLimit <= pageSkip) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be greater than to skip',
                })
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

            const fieldTypes: { [key in keyof IJob]?: 'string' | 'number' | 'boolean' | 'date' } = {
                title: 'string',
                introduction: 'string',
                description: 'string',
                minSalary: 'number',
                maxSalary: 'number',
                numberPerson: 'number',
                unit: 'string',
                location: 'string',
                career: 'string',
                account: 'string',
                interviewer: 'string',
                address: 'string',
                timestamp: 'date',
                expiredDate: 'date',
                isDelete: 'boolean',
                isActive: 'boolean',
                type: 'string',
            }

            // Lọc và xác thực các trường hợp hợp lệ
            const filteredQuery = Object.keys(query)
                .filter((key) => key in fieldTypes) // Chỉ giữ lại các trường hợp có trong fieldTypes
                .reduce((obj, key) => {
                    const expectedType = fieldTypes[key as keyof IJob]
                    let value = query[key]

                    // Xử lý theo loại dữ liệu mong muốn
                    if (expectedType === 'number') {
                        value = parseInt(value, 10)
                        if (isNaN(value)) return obj // Bỏ qua nếu không phải số hợp lệ
                    } else if (expectedType === 'boolean') {
                        value = Boolean(value === 'true' || value === true)
                    } else if (expectedType === 'date') {
                        value = new Date(value)
                        if (isNaN(value.getTime())) return obj // Bỏ qua nếu không phải ngày hợp lệ
                    } else if (expectedType === 'string') {
                        value = value.toString()
                    }

                    // Thêm giá trị hợp lệ vào đối tượng query
                    obj[key] = value
                    return obj
                }, {} as any)

            if (expiredDate) {
                const currentDate = new Date()
                if (expiredDate == '1') filteredQuery.expiredDate = { $gte: currentDate }
                if (expiredDate == '-1') filteredQuery.expiredDate = { $lt: currentDate }
            }

            if (title) {
                filteredQuery.title = { $regex: title, $options: 'i' }
            }

            const jobs = await jobService.getListJobsByUser(query, filteredQuery, new Types.ObjectId(id))

            return res.json(jobs)
        } catch (error: unknown) {
            next(error)
        }
    },
    deleteJob: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid job ID format' })
            }
            // Gọi service để xoá công việc
            const deletedJob = await jobService.deleteJob(new Types.ObjectId(id))

            if (!deletedJob) {
                return res.status(404).json({ message: 'Job not found' })
            }

            return res.json(deletedJob)
        } catch (error: unknown) {
            next(error)
        }
    },
    addJob: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const {
                title,
                introduction,
                description,
                minSalary,
                maxSalary,
                numberPerson,
                account,
                interviewer,
                unit,
                career,
                address,
                expiredDate,
            } = req.body

            if (!title) {
                return res.status(400).json({ message: 'Title is required' })
            }

            if (minSalary == null || maxSalary == null) {
                return res.status(400).json({ message: 'Both minSalary and maxSalary are required' })
            }

            if (typeof minSalary !== 'number' || minSalary < 0) {
                return res.status(400).json({ message: 'minSalary must be a positive number' })
            }

            if (typeof maxSalary !== 'number' || maxSalary < 0) {
                return res.status(400).json({ message: 'maxSalary must be a positive number' })
            }

            if (typeof numberPerson !== 'number' || numberPerson < 1) {
                return res.status(400).json({ message: 'numberPerson must be a greater than 0' })
            }

            if (maxSalary < minSalary) {
                return res.status(400).json({ message: 'maxSalary must be greater than or equal to minSalary' })
            }

            if (!expiredDate) {
                return res.status(400).json({ message: 'Expired date is required.' })
            }

            const expirationDate = new Date(expiredDate)
            if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
                return res.status(400).json({ message: 'Expired date must be a valid future date.' })
            }

            if (!Types.ObjectId.isValid(account)) {
                return res.status(400).json({ message: 'Invalid account ID format' })
            }

            if (!Types.ObjectId.isValid(interviewer)) {
                return res.status(400).json({ message: 'Invalid account ID format' })
            }

            if (!Types.ObjectId.isValid(unit)) {
                return res.status(400).json({ message: 'Invalid unit ID format' })
            }

            if (!Types.ObjectId.isValid(career)) {
                return res.status(400).json({ message: 'Invalid career ID format' })
            }

            const accountResult = await accountService.getAccountById(account)

            if (!accountResult) {
                return res.status(404).json({ message: 'Account not found' })
            }

            const interviewerResult = await accountService.getAccountById(interviewer)
            if (!interviewerResult) {
                return res.status(404).json({ message: 'Interviewer not found' })
            }

            if ((interviewerResult.role as IRole).roleName !== 'INTERVIEWER') {
                return res.status(403).json({ message: interviewerResult.name + ' is not a interviewer' })
            }

            const unitResult = await unitService.getUnitById(unit)
            if (!unitResult) {
                return res.status(404).json({ message: 'Unit not found' })
            }

            const careerResult = await careerService.getCareerById(career)
            if (!careerResult) {
                return res.status(404).json({ message: 'Career not found' })
            }

            const newJob = await jobService.addJob({
                title: title,
                introduction: introduction,
                description: description,
                minSalary: Number(minSalary),
                maxSalary: Number(maxSalary),
                numberPerson: Number(numberPerson),
                account: account,
                unit: unit,
                career: career,
                interviewer: interviewer,
                address: address,
                expiredDate: new Date(expiredDate),
                isActive: false,
                isDelete: false,
            })
            return res.json(newJob)
        } catch (error: unknown) {
            next(error)
        }
    },
}

export default jobController
