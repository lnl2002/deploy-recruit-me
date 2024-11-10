import express from 'express'
import applicantReportController from '../controllers/applicantReportController'
import { requireRole } from '../middlewares/auth'

const applicantReportRouter = express.Router()

applicantReportRouter.patch('/:id', applicantReportController.updateApplicantReport)
applicantReportRouter.post(
    '/',
    requireRole(['RECRUITER', 'INTERVIEWER', 'INTERVIEW_MANAGER']),
    applicantReportController.addApplicantReport,
)

export default applicantReportRouter
