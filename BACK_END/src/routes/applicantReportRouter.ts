import express from 'express'
import applicantReportController from '../controllers/applicantReportController'
import { requireRole } from '../middlewares/auth'

const applicantReportRouter = express.Router()

applicantReportRouter.get(
    '/:applyId/apply',
    requireRole(['RECRUITER', 'INTERVIEWER']),
    applicantReportController.getApplicantReportByApply,
)
applicantReportRouter.patch(
    '/',
    requireRole(['RECRUITER', 'INTERVIEWER']),
    applicantReportController.updateApplicantReport,
)
applicantReportRouter.post(
    '/',
    requireRole(['RECRUITER', 'INTERVIEWER', 'INTERVIEW_MANAGER']),
    applicantReportController.addApplicantReport,
)

export default applicantReportRouter
