import express from 'express'
import unitController from '../controllers/unitController'

const unitRouter = express.Router()

unitRouter.get('/', unitController.getUnitList)
unitRouter.get('/:id', unitController.getUnitById)

unitRouter.post('/', unitController.addUnit)

export default unitRouter
