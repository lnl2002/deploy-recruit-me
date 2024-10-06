import { Express } from 'express'
import Test from './tests'
import Auth from './auth'

const routes = (app: Express) => {
    app.use('/api/v1/test', Test)
    app.use('/api/v1/auth', Auth)
}

export default routes
