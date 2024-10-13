import { Express } from 'express'
import swaggerUi from 'swagger-ui-express';
import Test from './tests'
import Auth from './auth'
import jobRouter from './jobRouter'
import MeetingRouter from './meetingRoom'
import ApplyRouter from './apply'
import swaggerSpec from '../swagger';

const routes = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/api/v1/test', Test)
    app.use('/api/v1/auth', Auth)
    app.use('/api/v1/jobs', jobRouter)
    app.use('/api/v1/meeting-room', MeetingRouter)
    app.use('/api/v1/applies', ApplyRouter)
}

export default routes
