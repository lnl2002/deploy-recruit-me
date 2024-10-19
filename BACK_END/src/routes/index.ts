import { Express } from 'express'
import Test from './tests'
import Auth from './auth'
import jobRouter from './jobRouter'
import applyRouter from './applyRouter'

const routes = (app: Express) => {
    app.use('/api/v1/test', Test)
    app.use('/api/v1/auth', Auth)
    app.use('/api/v1/jobs', jobRouter)
    app.use('/api/v1/apply', applyRouter)
}

export default routes
