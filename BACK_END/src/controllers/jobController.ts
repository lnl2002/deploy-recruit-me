import { Request, Response } from 'express'
import Job from '../models/jobModel'

const jobController = {
    getJobDetail: async (req: Request, res: Response) => {
        try {
            const { id } = req.params

            const job = await Job.findById(id)

            if (!job) {
                return res.status(404).json({ message: 'Job not found' })
            }

            return res.status(200).json(job)
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error })
        }
    },
    getJobList: async (req: Request, res: Response) => {
        try {
            const { _skip, _limit, _search, _sort_by, _order } = req.query
            const pageLimit = parseInt(_limit as string, 10) || 10
            const pageSkip = parseInt(_skip as string, 10) || 0
            const whereClause: any = {}
            if (_search) {
                whereClause['title'] = { $regex: _search, $options: 'i' }
            }
            if (_sort_by) {
                whereClause[`${_sort_by}`] = _order === 'asc' ? 1 : -1
            }

            if (pageLimit <= pageSkip) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be greater than to skip',
                })
            }

            const jobs = await Job.find({ where: {} })

            return res.status(200).json(jobs)
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error })
        }
    },
}

export default jobController
