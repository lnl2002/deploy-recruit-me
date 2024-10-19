import express, { Router } from 'express'
import cvController from '../controllers/cvController'

const cvRouter: Router = express.Router()

cvRouter.get('/', cvController.getListCV)

export default cvRouter
