import { Types } from 'mongoose'
import Job, { IJob } from '../models/jobModel'

interface JobQuery {
    limit?: number
    skip?: number
    sort_field?: string
    search?: string
    order?: 'asc' | 'desc'
    location?: string
    unit?: string
    career?: string
}

const jobService = {
    getListJobsByUser: async (query: JobQuery, id: Types.ObjectId): Promise<IJob[] | []> => {
        try {
            const {
                limit = 10,
                sort_field = 'createdAt',
                search = '',
                order = 'asc',
                skip = 0,
                location = '',
                unit = '',
                career = '',
            } = query

            const conditions: any = {
                account: id,
                isDelete: false,
                title: { $regex: search, $options: 'i' },
            }

            if (location) {
                conditions['unit.location'] = location
            }

            if (unit) {
                conditions.unit = new Types.ObjectId(unit)
            }

            if (career) {
                conditions.career = new Types.ObjectId(career)
            }

            const jobs = await Job.find(conditions)
                .populate({
                    path: 'unit', // Populate unit trước
                    populate: { path: 'location' }, // Sau đó populate tới location
                })
                .populate('career')
                .populate('account')
                .sort({ [sort_field]: order === 'asc' ? 1 : -1 })
                .limit(limit)
                .skip(skip)
                .lean()
                .exec()

            return jobs as IJob[] | []
        } catch (error) {
            throw new Error('Could not fetch jobs')
        }
    },
    getListJobs: async (query: JobQuery): Promise<IJob[] | []> => {
        try {
            const {
                limit = 10,
                sort_field = 'createdAt',
                search = '',
                order = 'asc',
                skip = 0,
                location = '',
                unit = '',
                career = '',
            } = query
            const conditions: any = {
                isDelete: false,
                title: { $regex: search, $options: 'i' },
            }

            if (location) {
                conditions['unit.location'] = location
            }

            if (unit) {
                conditions.unit = new Types.ObjectId(unit)
            }

            if (career) {
                conditions.career = new Types.ObjectId(career)
            }

            const jobs = await Job.find(conditions)
                .populate({
                    path: 'unit', // Populate unit trước
                    populate: { path: 'location' }, // Sau đó populate tới location
                })
                .populate('career')
                .populate('account')
                .sort({ [sort_field]: order === 'asc' ? 1 : -1 })
                .limit(limit)
                .skip(skip)
                .lean()
                .exec()

            return jobs as IJob[] | []
        } catch (error) {
            throw new Error('Could not fetch jobs')
        }
    },
    getJobById: async (jobId: Types.ObjectId): Promise<IJob | null> => {
        try {
            const job = await Job.findById(jobId)
                .populate({
                    path: 'unit', // Populate unit trước
                    populate: { path: 'location' }, // Sau đó populate tới location
                })
                .populate('career')
                .populate('account')
                .lean()
                .exec()

            return job as IJob | null
        } catch (error) {
            throw new Error('Could not fetch job')
        }
    },
    deleteJob: async (jobId: Types.ObjectId): Promise<IJob | null> => {
        try {
            const job = await Job.findByIdAndUpdate(jobId, { isDelete: true })
            return job
        } catch (error) {
            throw new Error('Could not soft delete job')
        }
    },
    addJob: async (job: Partial<IJob>): Promise<IJob | null> => {
        try {
            const newJob = Job.create(job)
            return newJob
        } catch (error) {
            throw new Error('Error creating job', error)
        }
    },
}

export default jobService
