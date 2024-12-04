import express, { Router } from 'express'
import accountController from '../controllers/accountController'
import { requireRole } from '../middlewares/auth'

const accountRouter: Router = express.Router()

accountRouter.get('/', accountController.getListAccounts)
accountRouter.get('/interviewers', requireRole(['INTERVIEW_MANAGER']), accountController.getInterviewerByUnit)

accountRouter.post('/', requireRole(['ADMIN']), accountController.createAccount);

accountRouter.put('/:accountId/status', requireRole(['ADMIN']), accountController.updateStatus)

export default accountRouter
