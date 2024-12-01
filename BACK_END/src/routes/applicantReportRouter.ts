import express, { Router } from 'express'
import applicantReportController from '../controllers/applicantReportController'
import { requireRole } from '../middlewares/auth'

const applicantReportRouter: Router = express.Router()

applicantReportRouter.get(
    '/:applyId/apply',
    requireRole(['RECRUITER', 'INTERVIEWER']),
    applicantReportController.getApplicantReportByApply,
)

applicantReportRouter.get(
    '/user',
    requireRole(['RECRUITER', 'INTERVIEWER', 'INTERVIEW_MANAGER']),
    applicantReportController.getApplicantReportByUser,
)

applicantReportRouter.patch(
    '/:applyId/apply',
    requireRole(['RECRUITER', 'INTERVIEWER', 'INTERVIEW_MANAGER']),
    applicantReportController.updateApplicantReport,
)
applicantReportRouter.post(
    '/:applyId/apply',
    requireRole(['RECRUITER', 'INTERVIEWER', 'INTERVIEW_MANAGER']),
    applicantReportController.addApplicantReport,
)

export default applicantReportRouter
