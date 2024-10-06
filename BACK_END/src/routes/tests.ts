import express, { NextFunction, Request, Response } from 'express'

const router: express.Router = express.Router()

router.get('/users', (req: Request, res: Response) => {
    return res.status(201).json({
        ab: 2,
        cd: 'a',
    })
})

router.get('/error', (req: Request, res: Response, next: NextFunction) => {
    try {
        throw new Error('This is a forced error!')
    } catch (err) {
        next(err)
    }
})

export default router
