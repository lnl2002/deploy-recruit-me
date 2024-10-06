import { Express } from 'express'
import Test from './tests'
import jobRouter from './jobRouter'

const routes = (app: Express) => {
    app.use('/api/v1/test', Test)
    app.use('/api/v1/jobs', jobRouter)
}

export default routes
