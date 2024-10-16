import express, { Router } from 'express'
import unitController from '../controllers/unitController'

const unitRouter: Router = express.Router()

unitRouter.get('/', unitController.getUnitList)
unitRouter.get('/:id', unitController.getUnitById)

unitRouter.post('/', unitController.addUnit)

export default unitRouter
