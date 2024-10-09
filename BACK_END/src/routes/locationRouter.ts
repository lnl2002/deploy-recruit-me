import express from 'express'
import locationtroller from '../controllers/locationController'

const locationRouter = express.Router()

locationRouter.get('/', locationtroller.getListLocation)
locationRouter.get('/:id', locationtroller.getLocationById)

locationRouter.post('/', locationtroller.addLocation)

export default locationRouter
