import express from 'express'
import cvController from '../controllers/cvController'

const cvRouter = express.Router()

cvRouter.get('/', cvController.getListCV)

export default cvRouter
