import { NextFunction, Request, Response } from 'express'
import { mailService } from "../services/mailServices/mailService"
import { genAnswer } from '../configs/gemini-chat-config'

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

    getAIAnswer: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { input, history } = req.body
            const respond = await genAnswer(input, history)
            console.log(respond);
            
            const cleanedResult = respond.response.text().replace('```json', '').replace('```', '')
            return res.status(200).json(JSON.parse(cleanedResult));
        } catch (error: unknown) {
            // next(error)
            return res.status(400).json({ message: 'AI not sent' });
        }
    },
}