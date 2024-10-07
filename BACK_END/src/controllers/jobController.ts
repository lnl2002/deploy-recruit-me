import { Request, Response } from 'express'
import { Types } from 'mongoose'
import jobService from '../services/jobService'
import accountService from '../services/accountService'
import unitService from '../services/unitService'
import careerService from '../services/careerService'

const jobController = {
    getJobDetail: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid job ID format' })
            }

            const job = await jobService.getJobById(new Types.ObjectId(id))

            if (!job) {
                return res.status(404).json({ message: 'Job not found' })
            }

            return res.status(200).json(job)
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error })
        }
    },
    getJobList: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { _skip, _limit, _search, _sort_by, _order, _location, _unit, _career } = req.query
            const pageLimit = parseInt(_limit as string, 10) || 10
            const pageSkip = parseInt(_skip as string, 10) || 0

            if (pageLimit <= pageSkip) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be greater than to skip',
                })
            }

            const query = {
                limit: pageLimit,
                skip: pageSkip,
                sort_field: _sort_by as string,
                search: _search as string,
                order: _order as 'asc' | 'desc',
                location: _location as string,
                unit: _unit as string,
                career: _career as string,
            }

            const jobs = await jobService.getListJobs(query)

            return res.status(200).json(jobs)
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error })
        }
    },
    getJobListByUser: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { _skip, _limit, _search, _sort_by, _order, _location, _unit, _career } = req.query
            const { id } = req.params

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid job ID format' })
            }

            const pageLimit = parseInt(_limit as string, 10) || 10
            const pageSkip = parseInt(_skip as string, 10) || 0

            if (pageLimit <= pageSkip) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be greater than to skip',
                })
            }

            const query = {
                limit: pageLimit,
                skip: pageSkip,
                sort_field: _sort_by as string,
                search: _search as string,
                order: _order as 'asc' | 'desc',
                location: _location as string,
                unit: _unit as string,
                career: _career as string,
            }

            const jobs = await jobService.getListJobsByUser(query, new Types.ObjectId(id))

            return res.status(200).json(jobs)
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error })
        }
    },
    deleteJob: async (req: Request, res: Response): Promise<Response> => {
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

            return res.status(200).json(deletedJob)
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error })
        }
    },
    addJob: async (req: Request, res: Response): Promise<Response> => {
        try {
            const {
                title,
                introduction,
                description,
                minSalary,
                maxSalary,
                numberPerson,
                account,
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

            if (maxSalary < minSalary) {
                return res.status(400).json({ message: 'maxSalary must be greater than or equal to minSalary' })
            }

            if (!Types.ObjectId.isValid(account)) {
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

            const unitResult = await unitService.getUnitById(unit)
            if (!unitResult) {
                return res.status(404).json({ message: 'Unit not found' })
            }

            const careerResult = await careerService.getCareerById(unit)
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
                address: address,
                expiredDate: new Date(expiredDate),
                isActive: false,
                isDelete: false,
            })
            return res.status(201).json(newJob)
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error })
        }
    },
}

export default jobController
