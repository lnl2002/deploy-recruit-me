import CV, { ICV } from '../models/cvModel'
import crypto from 'crypto'
import { s3 } from './s3Service'

const cvService = {
    getListCV: async (): Promise<ICV[] | []> => {
        const listCV = await CV.find({})
        return listCV
    },
    getCVById: async (cvId: string): Promise<ICV> => {
        const cv = await CV.findById(cvId)
        return cv
    },

    uploadEncryptedBufferToS3: async (
        encryptedBuffer: Buffer,
        bucketName: string,
        key: string, // Add a key for the object in S3
    ): Promise<any> => {
        // Return type depends on your S3 library
        return s3
            .upload({
                Bucket: bucketName,
                Key: key,
                Body: encryptedBuffer,
            })
            .promise()
    },

    encryptFileInMemory: async (fileBuffer: Buffer, key: Buffer, iv: Buffer): Promise<Buffer> => {
        try {
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
            let encryptedChunks = [cipher.update(fileBuffer)]
            encryptedChunks.push(cipher.final())
            return Buffer.concat(encryptedChunks)
        } catch (encryptionError) {
            console.error('Encryption error:', encryptionError)
            throw encryptionError // Re-throw the error to be handled in the route
        }
    },
}

export default cvService
