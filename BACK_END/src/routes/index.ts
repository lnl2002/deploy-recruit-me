import { Express } from 'express'
import Test from './tests'

const routes = (app: Express) => {
    app.use('/api/v1/test', Test)
}

export default routes
