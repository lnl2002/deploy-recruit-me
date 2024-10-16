import express, { Router } from 'express'
import applyController from '../controllers/apply'

const router: Router = express.Router()

router.put('/update-status', applyController.updateApplyStatus)

export default router
