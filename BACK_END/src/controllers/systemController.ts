import { NextFunction, Request, Response } from 'express'
import { mailService } from '../services/mailServices/mailService'
import { genAnswer } from '../configs/gemini-chat-config'
import Notification from '../models/notificationModel'

export const systemController = {
    mutipleMail: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { subject, body, receivers } = req.body
            const info = mailService.sendMailBase({
                subject,
                body: body,
                sendTo: receivers,
            })
            return res.status(200).json({ message: 'Email sent successfully' })
        } catch (error: unknown) {
            next(error)
            return res.status(400).json({ message: 'Email not sent' })
        }
    },

    getAIAnswer: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { input, history } = req.body
            const respond = await genAnswer(input, history)
            console.log(respond)

            const cleanedResult = respond.response.text().replace('```json', '').replace('```', '')
            return res.status(200).json(JSON.parse(cleanedResult))
        } catch (error: unknown) {
            // next(error)
            return res.status(400).json({ message: 'AI not sent' })
        }
    },

    createNotification: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { receiver, content, url } = req.body
            const notification = new Notification({ receiver, content, url, seen: false })
            await notification.save()
            return res.status(201).json(notification)
        } catch (error) {
            res.status(500).json({ error: 'Error when create noti: ' + error })
        }
    },

    getUserNotifications: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const userId = req.user._id
            const notifications = await Notification.find({ receiver: userId }).sort({seen:1, createdAt: -1 }).limit(10)
            return res.status(200).json(notifications)
        } catch (error) {
            res.status(500).json({ error: 'Error when get noti: ' + error })
        }
    },

    markAsSeen: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { notificationId } = req.params
            console.log(notificationId);
            
            const updates = req.body
            const notification = await Notification.findByIdAndUpdate( notificationId, { $set: { seen: true } }, { new: true } );
            return res.status(200).json(notification)
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },
}
