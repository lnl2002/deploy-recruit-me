import express, { Router } from 'express'
import jobController from '../controllers/jobController'
import { optionalAuthenticate, requireRole } from '../middlewares/auth'

const jobRouter: Router = express.Router()

jobRouter.get('/', optionalAuthenticate(), jobController.getJobList)
jobRouter.get('/user/:id', jobController.getJobListByUser)
jobRouter.get('/:id', jobController.getJobDetail)
jobRouter.get(
    '/interview-manager/list-jobs',
    requireRole(['INTERVIEW_MANAGER']),
    jobController.getJobsByInterviewManager,
)

jobRouter.post('/', requireRole(['RECRUITER']), jobController.addJob)

jobRouter.delete('/:id', jobController.deleteJob)

export default jobRouter
