import express, { Router } from 'express'
import meetingController from '../controllers/meetingRoom'
import { requireRole } from '../middlewares/auth'

const router: Router = express.Router()

// GET
router.get('/schedules', meetingController.getInterviewSchedules)
router.get('/list-candidate', requireRole(['INTERVIEWER', 'INTERVIEW_MANAGER']), meetingController.getListCandidates)
router.get('/url', meetingController.getMeetingRoomByUrl)

// POST
router.post('/create', meetingController.createMeetingRoom)

// PUT
router.put('/update-status', meetingController.updateMeetingStatus)

export default router
