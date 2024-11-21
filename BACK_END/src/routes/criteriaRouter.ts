import express, { Router } from 'express'
import { requireRole } from '../middlewares/auth'
import criteriaController from '../controllers/criteriaController'

const criteriaRouter: Router = express.Router()

criteriaRouter.get('/', criteriaController.getListCriteria)
criteriaRouter.post('/', criteriaController.addCriteria)

export default criteriaRouter
