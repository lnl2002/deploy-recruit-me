import express from 'express'
import applyController from '../controllers/apply'

const router = express.Router()

router.put('/update-status', applyController.updateApplyStatus)

export default router
