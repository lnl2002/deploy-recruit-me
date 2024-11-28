import { NextFunction, Request, Response } from 'express'
import Apply, { IApply } from '../models/applyModel'
import CVStatus from '../models/cvStatusModel'
import applyService from '../services/apply'
import { AppError } from '../constants/AppError'
import mongoose from 'mongoose'
import CV from '../models/cvModel'
import Job from '../models/jobModel'

const ApplyController = {
    // Create a new application
    applyToJob: async (req: Request, res: Response): Promise<void> => {
        try {
            // 1. Extract data from the request body
            const { cvId, jobId, cvInfo } = req.body
            const cvContent = JSON.stringify(cvInfo);

            // 3. Find the CV, Job, and default CVStatus
            const [cv, job, defaultStatus] = await Promise.all([
                CV.findById(cvId),
                Job.findById(jobId),
                CVStatus.findOne({ name: 'New' }), // Assuming "New" is a default status
            ])

            const savedApply = await applyService.createApply({
                cvId: cv._id,
                jobId: job._id,
                defaultStatusId: defaultStatus._id,
                createdBy: req.user._id,
            })

            //OCR and calculate apply score
            applyService.extractTextFromPdf(cvContent, jobId, savedApply._id.toString())

            // 7. Send a success response
            res.status(201).json({
                message: 'Application created successfully',
                apply: savedApply,
            })
        } catch (error) {
            // 8. Handle errors
            console.error(error)
            res.status(500).json(AppError.UNKNOWN_ERROR)
        }
    },

    // Change application status
    changeStatus: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const { status } = req.body
            const updatedApply = await Apply.findByIdAndUpdate(id, { status }, { new: true })
            if (!updatedApply) {
                res.status(404).json({ message: 'Application not found' })
                return
            }
            res.status(200).json(updatedApply)
        } catch (error) {
            res.status(500).json({ message: 'Error changing status', error })
        }
    },

    // Get all CVs by job ID
    getAllCVsByJobId: async (req: Request, res: Response): Promise<void> => {
        try {
            const { jobId } = req.params
            const { sort, status } = req.query
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const skip = (page - 1) * limit

            let cvStatusId = null
            if (status) {
                const data = await CVStatus.findOne({
                    name: status,
                })
                if (data) {
                    cvStatusId = data._id
                }
            }

            const totalApplications = await Apply.countDocuments({
                job: jobId,
                ...(status ? { status: cvStatusId } : {}),
            })
            const applications = await Apply.find({
                job: jobId,
                ...(status ? { status: cvStatusId } : {}),
            })
                .populate('cv')
                .populate('status')
                .sort({ createdAt: sort === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit)

            res.status(200).json({
                total: totalApplications,
                page,
                totalPages: Math.ceil(totalApplications / limit),
                data: applications,
            })
        } catch (error) {
            res.status(500).json({ message: 'Error fetching CVs', error })
        }
    },

    // Get application by ID
    getApplicationById: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const application = await Apply.findById(id).populate('cv job status assigns createdBy applicantReports')
            if (!application) {
                res.status(404).json({ message: 'Application not found' })
                return
            }
            res.status(200).json(application)
        } catch (error) {
            res.status(500).json({ message: 'Error fetching application', error })
        }
    },

    // Delete application
    deleteApplication: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const deletedApply = await Apply.findByIdAndDelete(id)
            if (!deletedApply) {
                res.status(404).json({ message: 'Application not found' })
                return
            }
            res.status(200).json({ message: 'Application deleted successfully' })
        } catch (error) {
            res.status(500).json({ message: 'Error deleting application', error })
        }
    },

    //get application info of a candidate if available
    getApplicationInfoOfCandidate: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user._id
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                res.status(400).json({ message: 'invalid user ID' })
            }
            const { jobId } = req.params
            const application = await Apply.findOne({ job: jobId, createdBy: userId }).populate(
                'cv job status assigns createdBy',
            )
            if (!application) {
                res.status(404).json({ message: 'Application not found' })
                return
            }
            res.status(200).json(application)
        } catch (error) {
            res.status(500).json({ message: 'Error fetching application', error })
        }
    },

    getAllApplication: async (req: Request<object, object, object, ApplyQueryParams>, res: Response) => {
        try {
            const userId = req.user._id
            const { status, page, limit, sortBy, sortOrder } = req.query

            const query: mongoose.FilterQuery<IApply> = { createdBy: new mongoose.Types.ObjectId(userId) }

            if (status) {
                query.status = new mongoose.Types.ObjectId(status)
            }

            const skip = (parseInt(page || '1', 10) - 1) * parseInt(limit || '10', 10)
            const sortOptions: { [key: string]: 1 | -1 } = {} // Type safe sort options
            if (sortBy) {
                const sortByField = Array.isArray(sortBy) ? sortBy[0] : sortBy
                sortOptions[sortByField] = sortOrder === 'asc' ? 1 : -1
            }

            const applies: IApply[] = await Apply.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit || '10', 10))
                .populate('job') // Populate job field
                .populate('status') // Populate status field

            const totalApplies = await Apply.countDocuments(query)

            res.json({
                applies,
                totalApplies,
                currentPage: parseInt(page || '1', 10),
                totalPages: Math.ceil(totalApplies / parseInt(limit || '10', 10)),
            })
        } catch (error: unknown) {
            // Use `unknown` for general errors
            console.error('Error fetching applies:', error)

            if (error instanceof mongoose.Error.CastError) {
                return res.status(400).json({ message: 'Invalid status or user ID.' })
            }

            res.status(500).json({ message: 'Error fetching applies.' })
        }
    },

    getAllStatus: async (req: Request, res: Response) => {
        try {
            const statuses = await CVStatus.find() // Find all CV statuses

            res.json(statuses) // Send the statuses as JSON
        } catch (error: unknown) {
            console.error('Error fetching statuses:', error)
            res.status(500).json({ message: 'Error fetching statuses.' })
        }
    },

    analyzeCV: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { file } = req;
            const result = await applyService.textractPdf(file.path);
            res.status(200).json({
                data: result
            })
        } catch (error) {
            console.log("analyzeCV error:", error);
            next(error);
        }
    }
}

export default ApplyController

interface ApplyQueryParams {
    status?: string
    page?: string
    limit?: string
    sortBy?: string | string[] // Allow single or array of strings
    sortOrder?: 'asc' | 'desc'
}
