import express, { NextFunction, Request } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { FRONTEND_URL } from '../utils/env'
const router: express.Router = express.Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate('google', { session: false }), (req: Request, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;

    const accessToken  = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' })
    const refreshToken  = jwt.sign(user, process.env.JWT_REFRESH_SECRET!, { expiresIn: '90d' })


    res.send(`
        <html>
        <body>
            <script>
                window.opener.postMessage({
                    accessToken: '${accessToken}',
                    refreshToken: '${refreshToken}',
                    user: '${JSON.stringify(user)}'
                }, '${FRONTEND_URL}');  // Thay thế bằng URL frontend hợp lệ
                window.close();  // Đóng popup sau khi gửi message
            </script>
            <p>Login successful! You can close this window.</p>
        </body>
        </html>
    `);
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
