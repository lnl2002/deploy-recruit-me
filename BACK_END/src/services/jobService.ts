import { Types } from 'mongoose'
import Job, { IJob } from '../models/jobModel'

const jobService = {
    getListJobsByUser: async (
        query: any,
        filteredQuery: any,
        accountId: Types.ObjectId,
    ): Promise<{ jobs: IJob[]; total: number }> => {
        try {
            const { sort_field = 'createdAt', order = 'asc', limit, skip } = query

            console.log({ account: accountId, ...filteredQuery })

            const total = await Job.countDocuments({ account: accountId, ...filteredQuery })

            const jobs = await Job.find({ account: accountId, ...filteredQuery })
                .populate({
                    path: 'unit', // Populate unit trước
                    populate: { path: 'location' }, // Sau đó populate tới location
                })
                .populate('career')
                .populate('account')
                .populate('interviewer')
                .populate('location')
                .sort({ [sort_field]: order === 'asc' ? 1 : -1 })
                .limit(limit)
                .skip(skip)
                .lean()
                .exec()

            return { jobs, total }
        } catch (error) {
            throw new Error('Could not fetch jobs')
        }
    },
    getListJobs: async (query: any, filteredQuery: any): Promise<{ jobs: IJob[]; total: number }> => {
        try {
            const { sort_field = 'createdAt', order = 'asc', limit, skip } = query

            const total = await Job.countDocuments(filteredQuery)

            const jobs = await Job.find(filteredQuery)
                .populate({
                    path: 'unit', // Populate unit trước
                    populate: { path: 'location' }, // Sau đó populate tới location
                })
                .populate('career')
                .populate('account')
                .populate('interviewer')
                .populate('location')
                .sort({ [sort_field]: order === 'asc' ? 1 : -1 })
                .limit(limit)
                .skip(skip)
                .lean()
                .exec()

            return { jobs, total }
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
                .populate('interviewer')
                .populate('location')
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
