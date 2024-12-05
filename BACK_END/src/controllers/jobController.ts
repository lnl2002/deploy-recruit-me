/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextFunction, Request, Response } from 'express'
import mongoose, { Types } from 'mongoose'
import jobService from '../services/jobService'
import accountService from '../services/accountService'
import unitService from '../services/unitService'
import careerService from '../services/careerService'
import { IRole } from '../models/roleModel'
import { IJob } from '../models/jobModel'
import locationService from '../services/locationService'
import criteriaService from '../services/criteriaService'

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

            // if (pageLimit <= pageSkip) {
            //     return res.status(400).json({
            //         status: 'error',
            //         message: 'Limit must be greater than to skip',
            //     })
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
                    startDate: 'string',
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
                        value = Boolean(value === '1' || value === true || value === 'true')
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

            if (filteredQuery.startDate) {
                const currentDate = new Date()
                if (filteredQuery.startDate == '1') filteredQuery.startDate = { $gte: currentDate }
                if (filteredQuery.startDate == '-1') filteredQuery.startDate = { $lt: currentDate }
            }

            if (title) {
                filteredQuery.title = { $regex: title, $options: 'i' }
            }

            if (filteredQuery.isDelete === undefined) {
                filteredQuery.isDelete = false
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
    deleteJob: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params
            const account = req.user

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid job ID format' })
            }

            // Kiểm tra quyền truy cập
            if (account.role !== 'RECRUITER') {
                return res.status(403).json({ message: 'Forbidden' })
            }

            const job = await jobService.getJobById(new mongoose.Types.ObjectId(id))

            if (!job) {
                return res.status(404).json({ message: 'Job not found' })
            }

            // Kiểm tra quyền truy cập
            if (String(account._id) !== String(job.account?._id ?? '')) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            if (job.status === 'approved') {
                return res.status(403).json({ message: 'Cannot deleted an approved job' })
            }

            // Gọi service để xoá công việc
            const deletedJob = await jobService.deleteJob(new Types.ObjectId(id), job.isDelete)

            if (!deletedJob) {
                return res.status(404).json({ message: 'Job not found' })
            }

            return res.json(deletedJob)
        } catch (error: unknown) {
            next(error)
        }
    },
    restoreJob: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { jobId } = req.params
            const account = req.user

            if (!Types.ObjectId.isValid(jobId)) {
                return res.status(400).json({ message: 'Invalid job ID format' })
            }

            // Kiểm tra quyền truy cập
            if (account.role !== 'RECRUITER') {
                return res.status(403).json({ message: 'Forbidden' })
            }

            const job = await jobService.getJobById(new mongoose.Types.ObjectId(jobId))

            if (!job) {
                return res.status(404).json({ message: 'Job not found' })
            }

            // Kiểm tra quyền truy cập
            if (String(account._id) !== String(job.account?._id ?? '')) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            if (!job.isDelete) {
                return res.status(403).json({ message: 'Cant not restore job with isDelete false' })
            }

            // Gọi service để xoá công việc
            const deletedJob = await jobService.restoreJob(new Types.ObjectId(jobId))

            if (!deletedJob) {
                return res.status(404).json({ message: 'Job not found' })
            }

            return res.json(deletedJob)
        } catch (error: unknown) {
            next(error)
        }
    },
    updateJob: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { jobId } = req.params
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
                startDate,
                type,
                location,
                criterias,
            } = req.body

            const account = req.user

            // Kiểm tra quyền truy cập
            if (account.role !== 'RECRUITER') {
                return res.status(403).json({ message: 'Forbidden' })
            }

            if (!Types.ObjectId.isValid(jobId)) {
                return res.status(400).json({ message: 'Invalid job ID format' })
            }

            const job = await jobService.getJobById(new mongoose.Types.ObjectId(jobId))

            if (!job) {
                return res.status(404).json({ message: 'Job not found' })
            }

            // Kiểm tra quyền truy cập
            if (String(account._id) !== String(job.account?._id ?? '')) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            if (job.status === 'approved') {
                return res.status(403).json({ message: 'Cannot update an approved job' })
            }

            // Object chứa các trường cần cập nhật
            const updateFields: Record<string, unknown> = {}

            if (title) updateFields.title = title
            if (introduction) updateFields.introduction = introduction
            if (description) updateFields.description = description
            if (benefits) updateFields.benefits = benefits
            if (requests) updateFields.requests = requests

            if (minSalary != null) {
                if (typeof minSalary !== 'number' || minSalary < 0) {
                    return res.status(400).json({ message: 'minSalary must be a positive number' })
                }
                updateFields.minSalary = minSalary
            }

            if (maxSalary != null) {
                if (typeof maxSalary !== 'number' || maxSalary < 0 || maxSalary < minSalary) {
                    return res
                        .status(400)
                        .json({ message: 'maxSalary must be a positive number and greater than minSalary' })
                }
                updateFields.maxSalary = maxSalary
            }

            if (numberPerson != null) {
                if (typeof numberPerson !== 'number' || numberPerson < 1) {
                    return res.status(400).json({ message: 'numberPerson must be greater than 0' })
                }
                updateFields.numberPerson = numberPerson
            }

            if (interviewManager) {
                if (!Types.ObjectId.isValid(interviewManager)) {
                    return res.status(400).json({ message: 'Invalid interview manager ID format' })
                }
                const interviewManagerResult = await accountService.getAccountById(interviewManager)
                if (!interviewManagerResult) {
                    return res.status(404).json({ message: 'Interview manager not found' })
                }
                if ((interviewManagerResult.role as IRole).roleName !== 'INTERVIEW_MANAGER') {
                    return res
                        .status(403)
                        .json({ message: `${interviewManagerResult.name} is not an interview manager` })
                }
                updateFields.interviewManager = interviewManager
            }

            if (unit) {
                if (!Types.ObjectId.isValid(unit)) {
                    return res.status(400).json({ message: 'Invalid unit ID format' })
                }
                const unitResult = await unitService.getUnitById(unit)
                if (!unitResult) {
                    return res.status(404).json({ message: 'Unit not found' })
                }
                updateFields.unit = unit
            }

            if (career) {
                if (!Types.ObjectId.isValid(career)) {
                    return res.status(400).json({ message: 'Invalid career ID format' })
                }
                const careerResult = await careerService.getCareerById(career)
                if (!careerResult) {
                    return res.status(404).json({ message: 'Career not found' })
                }
                updateFields.career = career
            }

            if (address) updateFields.address = address

            const today = resetToStartOfDay(new Date().toString())

            if (expiredDate) {
                const expirationDate = resetToStartOfDay(expiredDate)
                if (isNaN(expirationDate.getTime()) || expirationDate <= today) {
                    return res.status(400).json({ message: 'Expired date must be a valid future date' })
                }
                updateFields.expiredDate = expirationDate
            }

            if (startDate) {
                const startionDate = resetToStartOfDay(startDate)
                if (isNaN(startionDate.getTime()) || startionDate < today) {
                    return res.status(400).json({ message: 'Start date must be a valid future date' })
                }
                updateFields.startDate = startionDate
            }

            if (type) updateFields.type = type

            if (location) {
                if (!Types.ObjectId.isValid(location)) {
                    return res.status(400).json({ message: 'Invalid location ID format' })
                }
                const locationResult = await locationService.getLocationById(location)
                if (!locationResult) {
                    return res.status(404).json({ message: 'Location not found' })
                }
                updateFields.location = location
            }

            if (criterias) {
                if (!Array.isArray(criterias) || criterias.length === 0) {
                    return res.status(400).json({ message: 'Criterias must be a non-empty array' })
                }
                const areAllObjectIds = criterias.every((item) => Types.ObjectId.isValid(item))
                if (!areAllObjectIds) {
                    return res.status(400).json({ message: 'All elements in criterias must be valid ObjectIds' })
                }
                const criteriaObjId = criterias.map((criteria) => new Types.ObjectId(criteria))
                const existingCriterias = await criteriaService.getListCriteria({ _id: { $in: criteriaObjId } })
                if (existingCriterias.length !== criterias.length) {
                    return res.status(400).json({ message: 'Some criteria do not exist' })
                }
                updateFields.criterias = criterias
            }

            // Thực hiện cập nhật
            const updatedJob = await jobService.updateJob(new mongoose.Types.ObjectId(jobId), {
                ...updateFields,
                status: 'pending',
            })

            return res.json(updatedJob)
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
                startDate,
                type,
                location,
                criterias,
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
                return res.status(400).json({ message: 'Expired date is required' })
            }

            if (!benefits) {
                return res.status(400).json({ message: 'Benefits is required' })
            }

            if (!requests) {
                return res.status(400).json({ message: 'Requests is required' })
            }

            if (!type) {
                return res.status(400).json({ message: 'Type is required' })
            }

            if (!Array.isArray(criterias) || criterias.length === 0) {
                return res.status(400).json({ message: 'Group Criteria is required' })
            }

            const expirationDate = resetToStartOfDay(expiredDate)
            const startionDate = resetToStartOfDay(startDate)
            const today = resetToStartOfDay(new Date().toString())

            if (isNaN(expirationDate.getTime()) || expirationDate <= today) {
                return res.status(400).json({ message: 'Expired date must be a valid future date' })
            }

            if (isNaN(startionDate.getTime()) || startionDate.getTime() < today.getTime()) {
                return res.status(400).json({ message: 'Started date must be a valid future date' })
            }

            if (expirationDate.getTime() < startionDate.getTime()) {
                return res.status(400).json({ message: 'Expiration date must be greater than startion date' })
            }

            if (!Types.ObjectId.isValid(interviewManager)) {
                return res.status(400).json({ message: 'Invalid interview manager ID format' })
            }

            const areAllObjectIds = criterias.map((item) => mongoose.Types.ObjectId.isValid(item))

            if (!areAllObjectIds) {
                return res.status(400).json({ message: 'All elements in Group Criteria must be valid ObjectIds' })
            }

            const criteriaObjId = criterias.map((critera) => new mongoose.Types.ObjectId(critera))

            const existingCriterias = await criteriaService.getListCriteria({ _id: { $in: criteriaObjId } })

            if (existingCriterias.length !== criterias.length) {
                return res.status(400).json({ message: 'Some criteria do not exist' })
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
                startDate: new Date(startDate),
                isActive: false,
                isDelete: false,
                status: 'pending',
                criterias: criterias,
                type: type,
            })
            return res.json(newJob)
        } catch (error: unknown) {
            next(error)
        }
    },
    getJobsByInterviewManager: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { page, limit, status, search } = req.query

            let listStatus = []
            if (status) {
                listStatus = (status as string).split(',')
            }

            const interviewManagerId = req?.user?._id || ''

            if (!mongoose.Types.ObjectId.isValid(interviewManagerId)) {
                return res.status(400).json({
                    message: 'Bad request',
                })
            }

            // Chuyển đổi các giá trị query sang định dạng số nếu có
            const filterOptions = {
                interviewManagerId: interviewManagerId,
                page: parseInt(page as string, 10) || 1,
                limit: parseInt(limit as string, 10) || 10,
                status: listStatus as string[],
                search: search as string,
            }

            const jobs = await jobService.getJobsByInterviewManager(filterOptions)

            res.status(200).json(jobs)
        } catch (error) {
            next(error)
        }
    },
    updateJobStatus: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { jobId, status, rejectReason } = req.body

            const userId = req?.user?._id || ''

            if (!userId) {
                return res.status(401).json({ message: 'UNAUTHORIZED' })
            }

            if (
                !['pending', 'approved', 'published', 'expired', 'reopened', 'rejected', 'completed'].includes(status)
            ) {
                return res.status(400).json({ message: 'BAD REQUEST' })
            }

            const job = await jobService.getJobById(new mongoose.Types.ObjectId(jobId))

            const isValidDate = isCurrentDateInRange(job.startDate.toString(), job.expiredDate.toString())

            if (status === 'completed') {
                if (job.status !== 'approved' || !isValidDate) {
                    return res
                        .status(400)
                        .json({ message: 'You can not complete job without job approval or job expired' })
                } else if (userId !== job.account._id) {
                    return res
                        .status(401)
                        .json({ message: 'You do not have permission to move to completed status for this job' })
                }
            }

            if (status === 'rejected' && !rejectReason) {
                return res.status(400).json({ message: 'Reject reason is required' })
            }

            if (
                !jobService.checkAuthorizeUpdateJobStatus({
                    jobId: jobId.toString() as string,
                    userId,
                })
            ) {
                return res.status(403).json({ message: 'You cannot update this job' })
            }

            const jobs = await jobService.updateJobStatus({
                jobId: jobId.toString() as string,
                status: status as string,
                rejectReason: rejectReason?.toString() as string,
            })

            res.status(200).json(jobs)
        } catch (error) {
            next(error)
        }
    },
}

function resetToStartOfDay(date: string) {
    const newDate = new Date(date)
    newDate.setHours(0, 0, 0, 0)
    return newDate
}

function isCurrentDateInRange(startDate: string, expiredDate: string) {
    const currentDate = resetToStartOfDay(new Date().toString())
    const start = resetToStartOfDay(startDate)
    const end = resetToStartOfDay(expiredDate)

    return currentDate >= start && currentDate <= end
}

export default jobController
