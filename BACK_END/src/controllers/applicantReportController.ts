import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import applicantReportService from '../services/applicantReportService'
import accountService from '../services/accountService'
import { IDetailCriteria } from '../models/applicantReportModel'
import Apply from '../models/applyModel'
import applyService from '../services/apply'

const applicantReportController = {
    updateApplicantReport: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { applyId } = req.params
            const { details, createdBy, score, isPass } = req.body
            const account = req.user
            const updateFile: any = {}

            if (!mongoose.Types.ObjectId.isValid(applyId)) {
                return res.status(400).json({ message: 'Invalid apply id format' })
            }

            const apply = await Apply.findById(applyId)

            if (!apply._id) {
                return res.status(404).json({ message: 'Apply not found' })
            }

            const { applicantReports } = apply

            if (details) {
                if (!Array.isArray(details)) {
                    return res.status(400).json({ message: 'Details must be an array' })
                }
                const checkEmptyCriteriaName = (details as IDetailCriteria[]).some((criteria) => !criteria.criteriaName)
                if (checkEmptyCriteriaName) {
                    return res.status(400).json({ message: 'Criteria name can not be empty' })
                }
                updateFile.details = details
            } else {
                updateFile.details = []
            }

            const applicantReportResult = await applicantReportService.getApplicantReport({
                createdBy: account._id,
                _id: { $in: applicantReports },
            })

            if (!applicantReportResult?._id) {
                return res.status(404).json({ message: 'Applicant Report not found' })
            }

            if (createdBy) {
                if (!mongoose.Types.ObjectId.isValid(createdBy)) {
                    return res.status(400).json({ message: 'CreatedBy ID format' })
                }
                const account = await accountService.getAccountById(createdBy)
                if (!account) {
                    return res.status(404).json({ message: 'Account not found' })
                }
                updateFile.createdBy = account._id
            }

            if (score !== undefined) {
                updateFile.score = score
            }

            if (isPass !== undefined) {
                if (typeof isPass !== 'boolean') {
                    return res.status(400).json({ message: 'isPass must be a boolean' })
                }
                updateFile.isPass = isPass
            }

            const newApplicantReport = await applicantReportService.updateApplicantReport(
                new mongoose.Types.ObjectId(applicantReportResult?._id as string),
                updateFile,
            )

            return res.status(200).json(newApplicantReport)
        } catch (error) {
            next(error)
        }
    },
    addApplicantReport: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { applyId } = req.params
            const { details, score, isPass } = req.body
            const account = req.user
            // validate and add id in applies table

            if (!mongoose.Types.ObjectId.isValid(applyId)) {
                return res.status(400).json({ message: 'Invalid apply ID' })
            }

            const apply = await Apply.findById(applyId)

            if (!apply._id) {
                return res.status(404).json({ message: 'Apply not found' })
            }

            const { applicantReports } = apply

            const existApplicantReport = await applicantReportService.getApplicantReport({
                _id: { $in: applicantReports },
                createdBy: account._id,
            })

            if (existApplicantReport?._id) {
                return res.status(400).json({ message: 'Application report is existed' })
            }

            const newApplicantReport = await applicantReportService.addApplicantReport({
                details: Array.isArray(details) ? details : [],
                createdBy: new mongoose.Types.ObjectId(account._id),
                score: score ?? 0,
                isPass: isPass === true,
            })

            // Add the new report to the applicantReports array
            const newListApplicantReports = [
                ...applicantReports.map((id: any) => mongoose.Types.ObjectId.createFromHexString(id.toString())),
                new mongoose.Types.ObjectId(newApplicantReport._id as string),
            ]

            // Update the apply document
            await applyService.updateApply(new mongoose.Types.ObjectId(apply._id as string), {
                ...apply.toObject(),
                applicantReports: newListApplicantReports,
            })

            return res.status(200).json(newApplicantReport)
        } catch (error) {
            next(error)
        }
    },
    getApplicantReportByApply: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const account = req.user
            const { applyId } = req.params
            if (!applyId) {
                return res.status(400).json({ message: 'Apply ID is required' })
            }

            if (!mongoose.Types.ObjectId.isValid(applyId)) {
                return res.status(400).json({ message: 'Invalid ApplyId ID format' })
            }

            const applicantReport = await applicantReportService.getApplicantReport({
                apply: applyId,
                createdBy: account._id,
            })
            return res.status(200).json(applicantReport)
        } catch (error) {
            next(error)
        }
    },

    getApplicantReportByUser: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const account = req.user
            const applicantReport = await applicantReportService.getApplicantReport({
                createdBy: account._id,
            })

            if (!applicantReport) {
                return res.status(404).json({ message: 'Applicant Report not found' })
            }

            return res.status(200).json(applicantReport)
        } catch (error) {
            next(error)
        }
    },
}

export default applicantReportController
