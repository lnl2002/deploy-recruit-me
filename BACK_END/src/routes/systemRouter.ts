import express, { Router } from 'express'
import { systemController } from '../controllers/systemController'
import { requireRole } from '../middlewares/auth'

const systemRouter: Router = express.Router()

/*
example body 
{
    "subject": "phuongthan25503@gmail.com",
    "body": "Roger",
    "receivers": ["garenaobama@gmail.com"]
}
*/
systemRouter.post('/ai-chat', systemController.getAIAnswer)

/*email*/
systemRouter.post('/mail/send', systemController.mutipleMail)

/*notification*/
systemRouter.post('/notifications', systemController.createNotification) // Route to create a new notification
systemRouter.get('/notifications', requireRole(['CANDIDATE']), systemController.getUserNotifications) // Route to get notifications for a user
systemRouter.patch('/notifications/:notificationId/seen', systemController.markAsSeen) // Route to mark a notification as seen

export default systemRouter
