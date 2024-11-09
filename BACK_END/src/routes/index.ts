import { Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import Test from './tests'
import Auth from './auth'
import cvRouter from './cvRouter'
import jobRouter from './jobRouter'
import applyRouter from './applyRouter'
import MeetingRouter from './meetingRoom'
import ApplyRouter from './apply'
import swaggerSpec from '../swagger'
import roleRouter from './roleRouter'
import unitRouter from './unitRouter'
import locationRouter from './locationRouter'
import careerRouter from './careerRouter'
import accountRouter from './accountRouter'
import roomRouter from './roomRouter'
import systemRouter from './systemRouter'

const routes = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    app.use('/api/v1/test', Test)
    app.use('/api/v1/auth', Auth)
    app.use('/api/v1/cvs', cvRouter)
    app.use('/api/v1/jobs', jobRouter)
    app.use('/api/v1/apply', applyRouter)
    app.use('/api/v1/roles', roleRouter)
    app.use('/api/v1/units', unitRouter)
    app.use('/api/v1/careers', careerRouter)
    app.use('/api/v1/locations', locationRouter)
    app.use('/api/v1/meeting-room', MeetingRouter)
    app.use('/api/v1/applies', ApplyRouter)
    app.use('/api/v1/accounts', accountRouter)
    app.use('/api/v1/rooms', roomRouter)

    //common api of system
    app.use('/api/v1/system', systemRouter)
}

export default routes
