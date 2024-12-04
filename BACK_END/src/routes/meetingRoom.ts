import express, { Router } from 'express'
import meetingController from '../controllers/meetingRoom'
import { requireRole } from '../middlewares/auth'

const router: Router = express.Router()

// GET
router.get('/schedules', meetingController.getInterviewSchedules)
router.get('/list-candidate', requireRole(['INTERVIEWER', 'INTERVIEW_MANAGER', 'ADMIN']), meetingController.getListCandidates)
router.get('/url', meetingController.getMeetingRoomByUrl)
router.get('/get/:applyId', meetingController.getMeetingRoomByApplyId)
router.get('/get-all/:jobId', meetingController.getMeetingRoomsByJobId)
router.get(
    '/candidate-reject-reason',
    requireRole(['INTERVIEW_MANAGER', 'INTERVIEWER']),
    meetingController.getCandidateRejectReason,
)

// POST
router.post('/create', meetingController.createMeetingRoom)
router.post('/add-participant', requireRole(['INTERVIEW_MANAGER']), meetingController.addParticipant)

// PUT
router.put(
    '/update-status',
    requireRole(['CANDIDATE', 'INTERVIEW_MANAGER', 'INTERVIEWER']),
    meetingController.updateMeetingStatus,
)

//DELETE
router.delete('/remove-participant', requireRole(['INTERVIEW_MANAGER']), meetingController.removeParticipant)

export default router
