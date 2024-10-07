import express from 'express'
import jobController from '../controllers/jobController'

const jobRouter = express.Router()

jobRouter.get('/', jobController.getJobList)
jobRouter.get('/:id', jobController.getJobDetail)
jobRouter.delete('/:id', jobController.deleteJob)

export default jobRouter
