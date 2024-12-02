import cron from 'node-cron'
import { deleteMessagesFromQueues, receiveMessagesFromQueue } from '../configs/aws-queue'
import { S3_QUEUE_URL } from '../utils/env'
import { mailService } from '../services/mailServices/mailService'

export type MessageType = {
    Body: string | MessageBodyType
    MD5OfBody: string
    MessageId: string
    ReceiptHandle: string
}

export type MessageBodyType = {
    sendTo: string
    subject: string
    body: string
}

// Cron job mỗi 5 giây
cron.schedule('*/5 * * * * *', async () => {
    try {
        console.log('Running cron job to send email meeting rooms...')
        //1. get message
        const result = (await receiveMessagesFromQueue(S3_QUEUE_URL, 5)) as MessageType[]

        if (result.length > 0) {
            //2. send mail
            result.forEach((message) => {
                const data = JSON.parse(message.Body.toString()) as MessageBodyType

                mailService.sendMailBase({
                    subject: data.subject,
                    body: data.body,
                    sendTo: [data.sendTo],
                })
            })

            //3. delete mail
            deleteMessagesFromQueues(
                result.map((message) => {
                    return {
                        queueUrl: S3_QUEUE_URL,
                        receiptHandle: message.ReceiptHandle,
                    }
                }),
            )
        }
    } catch (error) {
        console.error('Error in cron job:', error)
    }
})
