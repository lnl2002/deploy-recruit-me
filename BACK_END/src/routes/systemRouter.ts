import express, { Router } from 'express'
import { systemController } from '../controllers/systemController'

const systemRouter: Router = express.Router()

/*
example body 
{
    "subject": "phuongthan25503@gmail.com",
    "body": "Roger",
    "receivers": ["garenaobama@gmail.com"]
}
*/
systemRouter.post('/mail/send', systemController.mutipleMail)

export default systemRouter
