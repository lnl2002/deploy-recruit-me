/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import applicantReportService from '../services/applicantReportService'
import accountService from '../services/accountService'
import { IDetailCriteria } from '../models/applicantReportModel'

const applicantReportController = {
    updateApplicantReport: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { applicantReport, applicantReportIds } = req.body
            const { details, createdBy, comment, isPass } = applicantReport
            const account = req.user
            const updateFile: any = {}

            if (!applicantReportIds) {
                return res.status(400).json({ message: 'ApplicantReportIds is required' })
            }

            if (!Array.isArray(applicantReportIds)) {
                return res.status(400).json({ message: 'ApplicantReportIds must be an array' })
            }

            for (const id of applicantReportIds) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ message: 'Invalid applicant report id format' })
                }
            }

            if (details) {
                if (!Array.isArray(details)) {
                    return res.status(400).json({ message: 'Details must be an array' })
                }
                const checkEmptyCriteriaName = (details as IDetailCriteria[]).some((criteria) => !criteria.criteriaName)
                if (checkEmptyCriteriaName) {
                    return res.status(400).json({ message: 'Criteria name can not be empty' })
                }
                updateFile.details = details
            }

            const applicantReportResult = await applicantReportService.getApplicantReport({
                createdBy: account._id,
                _id: { $in: applicantReportIds },
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

            if (comment) {
                updateFile.comment = comment
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
            const { details, comment, isPass } = req.body
            const account = req.user

            const newApplicantReport = await applicantReportService.addApplicantReport({
                details: Array.isArray(details) ? details : [],
                createdBy: new mongoose.Types.ObjectId(account._id),
                comment: comment ?? '',
                isPass: isPass === true,
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
