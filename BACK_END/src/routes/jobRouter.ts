import express from 'express'
import jobController from '../controllers/jobController'

const jobRouter = express.Router()

jobRouter.get('/', jobController.getJobList)
jobRouter.get('/:id', jobController.getJobDetail)

export default jobRouter
