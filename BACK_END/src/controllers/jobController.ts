import { Request, Response } from 'express'
import { Types } from 'mongoose'
import jobService from '../services/jobService'

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
}

export default jobController
