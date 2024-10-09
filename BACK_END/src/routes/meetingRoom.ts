import express from 'express'
import meetingController from '../controllers/meetingRoom'

const router = express.Router()

router.put('/update-status', meetingController.updateMeetingStatus)

export default router
