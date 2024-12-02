// src/config/aws-sqs-config.ts
import {
    SQSClient,
    SendMessageCommand,
    ReceiveMessageCommand,
    DeleteMessageCommand,
    SendMessageCommandInput,
    ReceiveMessageCommandInput,
    DeleteMessageCommandInput,
} from '@aws-sdk/client-sqs'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

// SQS Client Configuration
const sqsClient = new SQSClient({
    region: process.env.S3_REGION_TEXTRACT,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || '',
        secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
    },
})

/**
 * Send a message to a specific SQS queue
 * @param queueUrl - The URL of the SQS queue
 * @param messageBody - The content of the message
 * @param messageGroupId - The groupID of the message
 */
export const sendMessageToQueue = async (
    queueUrl: string,
    messageBody: string,
    messageGroupId: string,
): Promise<void> => {
    const params: SendMessageCommandInput = {
        QueueUrl: queueUrl,
        MessageBody: messageBody,
        MessageGroupId: messageGroupId,
    }

    try {
        const result = await sqsClient.send(new SendMessageCommand(params))
        console.log(`Message sent to queue ${queueUrl}:`, result.MessageId)
    } catch (error) {
        console.error(`Failed to send message to queue ${queueUrl}:`, error)
    }
}

/**
 * Receive messages from a specific SQS queue
 * @param queueUrl - The URL of the SQS queue
 * @param maxMessages - The maximum number of messages to fetch (default is 10)
 * @returns An array of messages received
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const receiveMessagesFromQueue = async (queueUrl: string, maxMessages = 5): Promise<any[]> => {
    const params: ReceiveMessageCommandInput = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: 5, // Long polling
    }

    try {
        const { Messages } = await sqsClient.send(new ReceiveMessageCommand(params))
        console.log(`Received ${Messages?.length || 0} messages from queue ${queueUrl}`)
        return Messages || []
    } catch (error) {
        console.error(`Failed to receive messages from queue ${queueUrl}:`, error)
        return []
    }
}

/**
 * Delete a message from a specific SQS queue
 * @param queueUrl - The URL of the SQS queue
 * @param receiptHandle - The receipt handle of the message to delete
 */
export const deleteMessageFromQueue = async (queueUrl: string, receiptHandle: string): Promise<void> => {
    const params: DeleteMessageCommandInput = {
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
    }

    try {
        await sqsClient.send(new DeleteMessageCommand(params))
        console.log(`Message deleted from queue ${queueUrl}`)
    } catch (error) {
        console.error(`Failed to delete message from queue ${queueUrl}:`, error)
    }
}

/**
 * Delete list message from a specific SQS queue
 * @param queueUrl - The URL of the SQS queue
 * @param receiptHandle - The receipt handle of the message to delete
 */
export const deleteMessagesFromQueues = async (
    messages: Array<{ queueUrl: string; receiptHandle: string }>,
): Promise<void> => {
    try {
        // Xóa tất cả các thông báo đồng thời
        await Promise.all(
            messages.map(async ({ queueUrl, receiptHandle }) => deleteMessageFromQueue(queueUrl, receiptHandle)),
        )
        console.log(`All messages deleted successfully`)
    } catch (error) {
        console.error(`Failed to delete some messages:`, error)
    }
}
