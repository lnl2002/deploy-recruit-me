import fs from 'fs'
import AWS from 'aws-sdk'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { textract } from '../configs/aws-config'

export const uploadPdfToS3 = async (filePath: string): Promise<string> => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION_TEXTRACT,
        correctClockSkew: true,
    })

    const fileContent = fs.readFileSync(filePath)
    const fileName = `uploads/${uuid()}-${path.basename(filePath)}`

    await s3
        .upload({
            Bucket: process.env.S3_BUCKET_TEXTRACT_NAME,
            Key: fileName,
            Body: fileContent,
            ContentType: 'application/pdf',
        })
        .promise()

    return fileName // Trả về key của tệp trong bucket
}

export const pollTextractJob = async (jobId: string): Promise<string> => {
    let jobStatus = 'IN_PROGRESS'
    const blocks = []

    while (jobStatus === 'IN_PROGRESS') {
        const response = await textract.getDocumentTextDetection({ JobId: jobId }).promise()

        if (response.JobStatus === 'SUCCEEDED') {
            jobStatus = 'SUCCEEDED'
            blocks.push(...(response.Blocks || []))
        } else if (response.JobStatus === 'FAILED') {
            throw new Error('Textract job failed')
        } else {
            // Đợi 5 giây trước khi kiểm tra lại
            await new Promise((resolve) => setTimeout(resolve, 5000))
        }
    }

    // Trích xuất text từ các block
    return blocks
        .filter((block) => block.BlockType === 'LINE')
        .map((block) => block.Text)
        .join('\n')
}

export const deleteS3File = async ({
    fileName,
}: {
    fileName: string
}): Promise<void> => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION_TEXTRACT,
            correctClockSkew: true,
        })
        const params = {
            Bucket: process.env.S3_BUCKET_TEXTRACT_NAME,
            Key: fileName,
        }

        // Delete the file
        await s3.deleteObject(params).promise()

    } catch (error) {
        console.error('Error deleting file from S3:', error)
        throw new Error('Failed to delete file from S3.')
    }
}
