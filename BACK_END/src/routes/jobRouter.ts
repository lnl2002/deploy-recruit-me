import express, { Router } from 'express'
import jobController from '../controllers/jobController'
import { optionalAuthenticate, requireRole } from '../middlewares/auth'

const jobRouter: Router = express.Router()

jobRouter.get('/', optionalAuthenticate(), jobController.getJobList)
jobRouter.get('/:id', jobController.getJobDetail)
jobRouter.get(
    '/interview-manager/list-jobs',
    requireRole(['INTERVIEW_MANAGER']),
    jobController.getJobsByInterviewManager,
)

jobRouter.post('/', requireRole(['RECRUITER']), jobController.addJob)

jobRouter.put('/update-status', requireRole(['INTERVIEW_MANAGER']), jobController.updateJobStatus)

jobRouter.delete('/:id', jobController.deleteJob)

export default jobRouter
