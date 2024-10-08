import { Express } from 'express'

import Test from './tests'
import Auth from './auth'
import cvRouter from './cvRouter'
import jobRouter from './jobRouter'
import roleRouter from './roleRouter'
import unitRouter from './unitRouter'
import locationRouter from './locationRouter'
import careerRouter from './careerRouter'

const routes = (app: Express) => {
    app.use('/api/v1/test', Test)
    app.use('/api/v1/auth', Auth)
    app.use('/api/v1/cvs', cvRouter)
    app.use('/api/v1/jobs', jobRouter)
    app.use('/api/v1/roles', roleRouter)
    app.use('/api/v1/units', unitRouter)
    app.use('/api/v1/careers', careerRouter)
    app.use('/api/v1/locations', locationRouter)
}

export default routes
