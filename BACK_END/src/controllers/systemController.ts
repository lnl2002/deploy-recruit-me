import { NextFunction, Request, Response } from 'express'
import { mailService } from "../services/mailServices/mailService"

export const systemController = {
    mutipleMail: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { subject, body, receivers } = req.body
            const info = mailService.sendMailBase({
                subject,
                body: body,
                sendTo: receivers
            })
            return res.status(200).json({ message: 'Email sent successfully' });
        } catch (error: unknown) {
            next(error)
            return res.status(400).json({ message: 'Email not sent' });
        }
    },
}