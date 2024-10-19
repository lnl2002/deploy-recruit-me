import express, { Router } from 'express'
import careerController from '../controllers/careerController'

const careerRouter: Router = express.Router()

careerRouter.get('/', careerController.getListCareer)
careerRouter.get('/:id', careerController.getCareerById)

careerRouter.post('/', careerController.addCareer)

export default careerRouter
