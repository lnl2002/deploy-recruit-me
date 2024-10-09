import express from 'express'
import roleController from '../controllers/roleController'

const roleRouter = express.Router()

roleRouter.get('/', roleController.getListRole)
roleRouter.get('/:id', roleController.getRoleById)

roleRouter.post('/', roleController.addRole)

export default roleRouter
