import { PipelineStage, Types } from 'mongoose'
import Job, { IJob } from '../models/jobModel'

const jobService = {
    getListJobsByUser: async (
        query: any,
        filteredQuery: any,
        accountId: Types.ObjectId,
    ): Promise<{ jobs: IJob[]; total: number }> => {
        const { sort_field = 'createdAt', order = 'asc', limit, skip } = query

        const total = await Job.countDocuments({ account: accountId, ...filteredQuery })

        // const jobs = await Job.find({ account: accountId, ...filteredQuery })
        //     .populate({
        //         path: 'unit', // Populate unit trước
        //         populate: { path: 'locations' }, // Sau đó populate tới location
        //     })
        //     .populate('career')
        //     .populate('account')
        //     .populate('interviewer')
        //     .populate('location')
        //     .sort({ [sort_field]: order === 'asc' ? 1 : -1 })
        //     .limit(limit)
        //     .skip(skip)
        //     .lean()
        //     .exec()

        const jobs = await Job.aggregate([
            {
                $match: { account: accountId, ...filteredQuery },
            },
            {
                $lookup: {
                    from: 'applies',
                    localField: '_id',
                    foreignField: 'job',
                    as: 'applies',
                },
            },
            {
                $unwind: {
                    path: '$applies',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'cvs',
                    localField: 'applies.cv',
                    foreignField: '_id',
                    as: 'applies.cv',
                },
            },
            {
                $unwind: {
                    path: '$applies.cv',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'applies.cv._id',
                    foreignField: 'cvs',
                    as: 'applies.account',
                },
            },
            {
                $unwind: {
                    path: '$applies.account',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'units',
                    localField: 'unit',
                    foreignField: '_id',
                    as: 'unit',
                },
            },
            {
                $unwind: {
                    path: '$unit',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'unit.locations',
                    foreignField: '_id',
                    as: 'unit.locations',
                },
            },
            {
                $lookup: {
                    from: 'careers',
                    localField: 'career',
                    foreignField: '_id',
                    as: 'career',
                },
            },
            {
                $unwind: {
                    path: '$career',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'interviewer',
                    foreignField: '_id',
                    as: 'interviewer',
                },
            },
            {
                $unwind: {
                    path: '$interviewer',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'account',
                    foreignField: '_id',
                    as: 'account',
                },
            },
            {
                $unwind: {
                    path: '$account',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'location',
                },
            },
            {
                $unwind: {
                    path: '$location',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    introduction: { $first: '$introduction' },
                    description: { $first: '$description' },
                    expiredDate: { $first: '$expiredDate' },
                    minSalary: { $first: '$minSalary' },
                    maxSalary: { $first: '$maxSalary' },
                    numberPerson: { $first: '$numberPerson' },
                    unit: { $first: '$unit' },
                    career: { $first: '$career' },
                    interviewer: { $first: '$interviewer' },
                    account: { $first: '$account' },
                    location: { $first: '$location' },
                    applies: { $push: '$applies' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    isDelete: { $first: '$isDelete' },
                    isActive: { $first: '$isActive' },
                    isFullTime: { $first: '$isFullTime' },
                    type: { $first: '$type' },
                    status: { $first: '$status' },
                },
            },
            {
                $sort: { [sort_field]: order === 'asc' ? 1 : -1 },
            },
            {
                $skip: Number(skip),
            },
            {
                $limit: Number(limit),
            },
        ])

        return { jobs, total }
    },
    getListJobs: async (query: any, filteredQuery: any, isowner: boolean): Promise<{ jobs: IJob[]; total: number }> => {
        const { sort_field = 'createdAt', order = 'asc', limit, skip } = query

        const pipeline: PipelineStage[] = [
            { $match: { ...filteredQuery } },
            ...buildLookupStages(), // Helper function to build lookup stages
            ...buildOwnerPipeline(isowner, filteredQuery), // Helper function for isowner-specific logic
            {
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    introduction: { $first: '$introduction' },
                    description: { $first: '$description' },
                    minSalary: { $first: '$minSalary' },
                    maxSalary: { $first: '$maxSalary' },
                    expiredDate: { $first: '$expiredDate' },
                    numberPerson: { $first: '$numberPerson' },
                    unit: { $first: '$unit' },
                    career: {
                        $first: '$career.name',
                    },
                    interviewManager: {
                        $first: {
                            _id: '$interviewManager._id',
                            email: '$interviewManager.email',
                            name: '$interviewManager.name',
                            image: '$interviewManager.image',
                        },
                    },
                    account: {
                        $first: {
                            _id: '$account._id',
                            email: '$account.email',
                            name: '$account.name',
                            image: '$account.image',
                        },
                    },
                    location: { $first: '$location' },
                    applies: {
                        $push: {
                            _id: '$applies._id',
                            status: { $arrayElemAt: ['$applies.status.name', 0] },
                            cv: '$applies.cv',
                        },
                    },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    isDelete: { $first: '$isDelete' },
                    isActive: { $first: '$isActive' },
                    isFullTime: { $first: '$isFullTime' },
                    type: { $first: '$type' },
                    status: { $first: '$status' },
                },
            },
        ]

        const totalJobs = await Job.aggregate(pipeline)
        const jobs = await Job.aggregate([
            ...pipeline,
            {
                $sort: { [sort_field]: order === 'asc' ? 1 : -1 },
            },
            {
                $skip: Number(skip),
            },
            {
                $limit: Number(limit),
            },
        ])

        return { jobs: jobs, total: totalJobs.length }
    },
    getJobById: async (jobId: Types.ObjectId): Promise<IJob | null> => {
        const job = await Job.findById(jobId)
            .populate({
                path: 'unit',
                populate: { path: 'locations' },
            })
            .populate('career')
            .populate('account')
            .populate('interviewManager')
            .populate('location')
            .populate({
                path: 'groupCriteria',
                select: '-unit',
                populate: { path: 'criterias' },
            })
            .lean()
            .exec()

        return job as IJob | null
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
    getJobsByInterviewManager: async ({
        interviewManagerId,
        page = 1,
        limit = 10,
        status,
        search,
    }: {
        interviewManagerId: string
        page?: number
        limit?: number
        status?: string[]
        search: string
    }) => {
        const skip = (page - 1) * limit

        const totalJobs = await Job.countDocuments({
            interviewManager: interviewManagerId,
            ...(status && status.length > 0 ? { status: { $in: status } } : {}),
            ...(search ? { title: search.toString() } : {}),
        })
        const jobs = await Job.find({
            interviewManager: interviewManagerId,
            ...(status && status.length > 0 ? { status: { $in: status } } : {}),
            ...(search ? { title: { $regex: search.toString(), $options: 'i' } } : {}),
        })
            .populate('unit')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })

        return {
            total: totalJobs,
            page,
            totalPages: Math.ceil(totalJobs / limit),
            data: jobs,
        }
    },
    updateJobStatus: async ({ jobId, status }: { jobId: string; status: string }) => {
        const update = await Job.updateOne(
            {
                _id: jobId,
            },
            {
                status: status,
            },
        )

        console.log('update', update)

        return update
    },
    checkAuthorizeUpdateJobStatus: async ({ jobId, userId }: { jobId: string; userId: string }) => {
        const data = Job.findOne({
            _id: jobId,
            interviewManager: userId,
        })

        if (data) {
            return true
        }

        return false
    },
}

// Helper function to build lookup stages
const buildLookupStages = (): PipelineStage[] => {
    return [
        {
            $lookup: {
                from: 'units',
                localField: 'unit',
                foreignField: '_id',
                as: 'unit',
            },
        },
        { $unwind: { path: '$unit', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'careers',
                localField: 'career',
                foreignField: '_id',
                as: 'career',
            },
        },
        { $unwind: { path: '$career', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'locations',
                localField: 'unit.locations',
                foreignField: '_id',
                as: 'unit.locations',
            },
        },
        {
            $lookup: {
                from: 'accounts',
                localField: 'interviewManager',
                foreignField: '_id',
                as: 'interviewManager',
            },
        },
        { $unwind: { path: '$interviewManager', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'accounts',
                localField: 'account',
                foreignField: '_id',
                as: 'account',
            },
        },
        { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'locations',
                localField: 'location',
                foreignField: '_id',
                as: 'location',
            },
        },
        { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
    ]
}

// Helper function for isowner-specific logic
const buildOwnerPipeline = (isowner: boolean, filteredQuery: any): PipelineStage[] => {
    if (!isowner) return []

    const pipeline: PipelineStage[] = [
        {
            $lookup: {
                from: 'applies',
                localField: '_id',
                foreignField: 'job',
                as: 'applies',
            },
        },
        { $unwind: { path: '$applies', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'cvstatuses',
                localField: 'applies.status',
                foreignField: '_id',
                as: 'applies.status',
            },
        },
        {
            $lookup: {
                from: 'accounts',
                localField: 'applies.cv._id',
                foreignField: 'cvs',
                as: 'applies.account',
            },
        },
        { $unwind: { path: '$applies.account', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'cvs',
                localField: 'applies.cv',
                foreignField: '_id',
                as: 'applies.cv',
            },
        },
        { $unwind: { path: '$applies.cv', preserveNullAndEmptyArrays: true } },
    ]

    if (filteredQuery.status === 'expired') {
        pipeline.push({
            $match: { 'applies.status.name': 'Accepted' },
        })
    }

    return pipeline
}

export default jobService
