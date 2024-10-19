import express, { Router } from 'express'
import meetingController from '../controllers/meetingRoom'

const router: Router = express.Router()

// GET
router.get('/schedules', meetingController.getInterviewSchedules)

// POST
router.post('/create', meetingController.createMeetingRoom);

// PUT
router.put('/update-status', meetingController.updateMeetingStatus)

export default router
