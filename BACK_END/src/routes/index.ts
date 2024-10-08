import { Express } from 'express'
import Test from './tests'
import Auth from './auth'
import jobRouter from './jobRouter'
import MeetingRouter from './meetingRoom'

const routes = (app: Express) => {
    app.use('/api/v1/test', Test)
    app.use('/api/v1/auth', Auth)
    app.use('/api/v1/jobs', jobRouter)
    app.use('/api/v1/meeting-room', MeetingRouter)
}

export default routes
