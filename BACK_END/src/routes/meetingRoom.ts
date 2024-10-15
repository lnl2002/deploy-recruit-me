import express from 'express'
import meetingController from '../controllers/meetingRoom'

const router = express.Router()

// GET
router.get('/schedules', meetingController.getInterviewSchedules)

// POST

// PUT
router.put('/update-status', meetingController.updateMeetingStatus)

export default router
