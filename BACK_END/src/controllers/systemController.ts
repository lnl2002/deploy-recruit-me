import { NextFunction, Request, Response } from 'express'
import { mailService } from '../services/mailServices/mailService'
import { genAnswer } from '../configs/gemini-chat-config'
import Notification from '../models/notificationModel'
import Career from '../models/careerModel'
import Job from '../models/jobModel'
import Location from '../models/locationModel'

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

    getAIJobQuery: async (req: Request, res: Response) => {
        const { city, career, minSalary } = req.query
        try {
            // Find the career ID based on the career name using a case-insensitive and diacritic-insensitive collation
            const careerDoc = await Career.findOne({ name: { $regex: new RegExp(career as string, 'i') } }).collation({
                locale: 'vi',
                strength: 1,
            })
            if (!careerDoc) {
                return res.status(404).json({ message: 'Career not found' })
            }

            // Find the location IDs based on the city using a case-insensitive and diacritic-insensitive collation
            const locationDocs = await Location.find({ city: { $regex: new RegExp(city as string, 'i') } }).collation({
                locale: 'vi',
                strength: 1,
            })
            const locationIds = locationDocs.map((location) => location._id)

            // Count the number of jobs matching the criteria
            const jobs = await Job.find({
                career: careerDoc._id,
                location: { $in: locationIds },
                minSalary: { $gte: Number(minSalary) },
            }).limit(3)

            res.status(200).json(jobs)
        } catch (error) {
            console.error('Error fetching job count:', error)
            res.status(500).json({ message: 'Internal server error' })
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
            const notifications = await Notification.find({ receiver: userId })
                .sort({ seen: 1, createdAt: -1 })
                .limit(10)
            return res.status(200).json(notifications)
        } catch (error) {
            res.status(500).json({ error: 'Error when get noti: ' + error })
        }
    },

    markAsSeen: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { notificationId } = req.params
            console.log(notificationId)

            const updates = req.body
            const notification = await Notification.findByIdAndUpdate(
                notificationId,
                { $set: { seen: true } },
                { new: true },
            )
            return res.status(200).json(notification)
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },
}
