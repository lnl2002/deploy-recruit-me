import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!)
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden' })
            }
            next()
        } catch (error) {
            console.log('error auth middleware', error);
            return res.status(401).json({ message: 'Invalid token' })
        }
    }
}
