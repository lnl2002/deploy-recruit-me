// routes/roomRoutes.js
import express from 'express'
import roomContronller from '../controllers/roomContronller'
import { requireRole } from '../middlewares/auth'

const twilioRouter = express.Router()

twilioRouter.get('/list-room', roomContronller.listRoom)

twilioRouter.post('/create-room', roomContronller.createRoom)
twilioRouter.post(
    '/access-token',
    requireRole(['CANDIDATE', 'RECRUITER', 'INTERVIEW_MANAGER']),
    roomContronller.getAccessToken,
)
twilioRouter.post('/end-room', roomContronller.endRoom)

export default twilioRouter
