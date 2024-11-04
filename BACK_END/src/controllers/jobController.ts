import { NextFunction, Request, Response } from 'express'
import mongoose, { Types } from 'mongoose'
import jobService from '../services/jobService'
import accountService from '../services/accountService'
import unitService from '../services/unitService'
import careerService from '../services/careerService'
import { IRole } from '../models/roleModel'
import { IJob } from '../models/jobModel'
import locationService from '../services/locationService'

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
            // owner = 1|-1
            const { skip, limit, title, sort_by, order, expiredDate, owner } = req.query
            const account = req.user

            const pageLimit = parseInt(limit as string, 10) || 10
            const pageSkip = parseInt(skip as string, 10) || 0
            const isOwner = owner === '1'

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

            const fieldTypes: { [key in keyof Partial<IJob>]?: 'string' | 'number' | 'boolean' | 'date' | 'objectId' } =
                {
                    title: 'string',
                    introduction: 'string',
                    description: 'string',
                    benefits: 'string',
                    requests: 'string',
                    minSalary: 'number',
                    maxSalary: 'number',
                    numberPerson: 'number',
                    unit: 'objectId',
                    career: 'objectId',
                    account: 'objectId',
                    location: 'objectId',
                    interviewManager: 'objectId',
                    address: 'string',
                    timestamp: 'date',
                    expiredDate: 'date',
                    isDelete: 'boolean',
                    isActive: 'boolean',
                    type: 'string',
                    status: 'string',
                }

            // Lọc và xác thực các trường hợp hợp lệ
            const filteredQuery = Object.keys(query)
                .filter((key) => key in fieldTypes) // Chỉ giữ lại các trường hợp có trong fieldTypes
                .reduce((obj, key) => {
                    const { Types } = require('mongoose')
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
                    } else if (expectedType === 'objectId') {
                        if (!Types.ObjectId.isValid(value)) return obj
                        value = new Types.ObjectId(value)
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

            if (filteredQuery.status?.includes(',')) {
                const multiStatus = filteredQuery.status.split(',')
                filteredQuery.status = { $in: multiStatus }
            }

            if (filteredQuery.interviewManager) {
                const account = await accountService.getAccountById(filteredQuery.interviewManager)
                if ((account.role as IRole).roleName !== 'INTERVIEW_MANAGER') {
                    res.status(404).json({ message: 'Interview manager not found' })
                }
            }

            if (filteredQuery.account) {
                const account = await accountService.getAccountById(filteredQuery.account)
                if (!account._id) {
                    res.status(404).json({ message: 'Account not found' })
                }
            }

            if (isOwner) {
                if (!account?._id) {
                    return res.status(401).json({ message: 'Unauthorized' })
                }
                if (account.role === 'RECRUITER') {
                    filteredQuery.account = new Types.ObjectId(account._id)
                } else if (account.role === 'INTERVIEW_MANAGER') {
                    filteredQuery.interviewManager = new Types.ObjectId(account._id)
                } else {
                    return res.status(403).json({ message: 'Forbidden' })
                }
            }

            if (filteredQuery.unit) {
                const unit = await unitService.getUnitById(filteredQuery.unit)
                if (!unit._id) {
                    res.status(404).json({ message: 'Unit not found' })
                }
            }

            if (filteredQuery.location) {
                const location = await locationService.getLocationById(filteredQuery.location)
                if (!location._id) {
                    res.status(404).json({ message: 'Loaction not found' })
                }
            }

            if (filteredQuery.career) {
                const career = await careerService.getCareerById(filteredQuery.career)
                if (!career._id) {
                    res.status(404).json({ message: 'Career not found' })
                }
            }

            const jobs = await jobService.getListJobs(query, filteredQuery, isOwner && !!account?._id)

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
                benefits: 'string',
                requests: 'string',
                minSalary: 'number',
                maxSalary: 'number',
                numberPerson: 'number',
                unit: 'string',
                location: 'string',
                career: 'string',
                account: 'string',
                interviewManager: 'string',
                address: 'string',
                timestamp: 'date',
                expiredDate: 'date',
                isDelete: 'boolean',
                isActive: 'boolean',
                type: 'string',
                status: 'string',
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

            if (filteredQuery.status?.includes(',')) {
                const multiStatus = filteredQuery.status.split(',')
                filteredQuery.status = { $in: multiStatus }
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
                benefits,
                requests,
                minSalary,
                maxSalary,
                numberPerson,
                interviewManager,
                unit,
                career,
                address,
                expiredDate,
                type,
                location,
            } = req.body

            const account = req.user

            if (account.role !== 'RECRUITER') {
                return res.status(403).json({ message: 'Forbidden' })
            }

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

            if (!benefits) {
                return res.status(400).json({ message: 'Benefits is required.' })
            }

            if (!requests) {
                return res.status(400).json({ message: 'Requests is required.' })
            }

            if (!type) {
                return res.status(400).json({ message: 'Type is required.' })
            }

            const expirationDate = new Date(expiredDate)
            if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
                return res.status(400).json({ message: 'Expired date must be a valid future date.' })
            }

            if (!Types.ObjectId.isValid(interviewManager)) {
                return res.status(400).json({ message: 'Invalid interview manager ID format' })
            }

            if (!Types.ObjectId.isValid(unit)) {
                return res.status(400).json({ message: 'Invalid unit ID format' })
            }

            if (!Types.ObjectId.isValid(career)) {
                return res.status(400).json({ message: 'Invalid career ID format' })
            }

            if (!Types.ObjectId.isValid(location)) {
                return res.status(400).json({ message: 'Invalid location ID format' })
            }

            const interviewManagerResult = await accountService.getAccountById(interviewManager)
            if (!interviewManagerResult) {
                return res.status(404).json({ message: 'Interview manager not found' })
            }

            if ((interviewManagerResult.role as IRole).roleName !== 'INTERVIEW_MANAGER') {
                return res.status(403).json({ message: interviewManagerResult.name + ' is not a interview manager' })
            }

            const unitResult = await unitService.getUnitById(unit)
            if (!unitResult) {
                return res.status(404).json({ message: 'Unit not found' })
            }

            const careerResult = await careerService.getCareerById(career)
            if (!careerResult) {
                return res.status(404).json({ message: 'Career not found' })
            }

            const locationResult = await locationService.getLocationById(location)
            if (!locationResult) {
                return res.status(404).json({ message: 'Location not found' })
            }

            const newJob = await jobService.addJob({
                title: title,
                introduction: introduction,
                description: description,
                benefits: benefits,
                requests: requests,
                minSalary: Number(minSalary),
                maxSalary: Number(maxSalary),
                numberPerson: Number(numberPerson),
                account: new Types.ObjectId(account?._id),
                unit: unit,
                career: career,
                location: location,
                interviewManager: interviewManager,
                address: address,
                expiredDate: new Date(expiredDate),
                isActive: false,
                isDelete: false,
                status: 'pending',
                type: type,
            })
            return res.json(newJob)
        } catch (error: unknown) {
            next(error)
        }
    },
    getJobsByInterviewManager: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { page, limit } = req.query

            const interviewManagerId = req?.user?._id || ''

            if (!mongoose.Types.ObjectId.isValid(interviewManagerId)) {
                return res.status(400).json({
                    message: 'Bad request',
                })
            }

            // Chuyển đổi các giá trị query sang định dạng số nếu có
            const filterOptions = {
                interviewManagerId: interviewManagerId as string,
                page: parseInt(page as string, 10) || 1,
                limit: parseInt(limit as string, 10) || 10,
            }

            const jobs = await jobService.getJobsByInterviewManager(filterOptions)

            res.status(200).json(jobs)
        } catch (error) {
            next(error)
        }
    },
}

export default jobController
