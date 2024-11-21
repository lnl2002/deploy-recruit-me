import express, { Router } from 'express'
import { requireRole } from '../middlewares/auth'
import groupsCriteriaController from '../controllers/groupCriteiaController'

const groupCriteriaRouter: Router = express.Router()

groupCriteriaRouter.get('/', groupsCriteriaController.getGroupCriterias)
groupCriteriaRouter.get('/:id', groupsCriteriaController.getGroupCriteria)
groupCriteriaRouter.post('/', groupsCriteriaController.addGroupCriteria)
groupCriteriaRouter.post('/', groupsCriteriaController.updateGroupCriteria)

export default groupCriteriaRouter
