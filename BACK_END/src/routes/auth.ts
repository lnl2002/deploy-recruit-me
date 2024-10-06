import express, { NextFunction, Request } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { FRONTEND_URL_ADMIN_HOME, FRONTEND_URL_CANDIDATE_HOME, FRONTEND_URL_HR_MANAGER_HOME, FRONTEND_URL_RECRUITER_HOME } from '../utils/env'
const router: express.Router = express.Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate('google', { session: false }), (req: Request, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (req as any).user;

    const decodedToken = jwt.decode(token);

    switch (decodedToken.role) {
        case 'CANDIDATE':
            return res.redirect(FRONTEND_URL_CANDIDATE_HOME);
        case 'RECRUITER':
            return res.redirect(FRONTEND_URL_RECRUITER_HOME);
        case 'HR_MANAGER':
            return res.redirect(FRONTEND_URL_HR_MANAGER_HOME);
        case 'ADMIN':
            return res.redirect(FRONTEND_URL_ADMIN_HOME);

        default:
            return res.redirect(FRONTEND_URL_CANDIDATE_HOME);
    }

})

router.get('/verify-token', (req, res, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        res.status(200).json({ user: decoded })
    } catch (err) {
        next(err)
    }
})

export default router
