// routes/roomRoutes.js
import express from 'express'
import roomContronller from '../controllers/roomContronller'

const twilioRouter = express.Router()

twilioRouter.post('/create-room', roomContronller.createRoom)
twilioRouter.post('/access-token', roomContronller.getAccessToken)
twilioRouter.post('/end-room', roomContronller.endRoom)

export default twilioRouter
