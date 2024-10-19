import express, { Router } from 'express'
import jobController from '../controllers/jobController'

const jobRouter: Router = express.Router()

jobRouter.get('/', jobController.getJobList)
jobRouter.get('/user/:id', jobController.getJobListByUser)
jobRouter.get('/:id', jobController.getJobDetail)

jobRouter.post('/', jobController.addJob)

jobRouter.delete('/:id', jobController.deleteJob)

export default jobRouter
