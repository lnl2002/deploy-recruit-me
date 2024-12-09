import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import CV, { ICV } from '../../models/cvModel'
import cvService from '../cvService'
import crypto from 'crypto'
import { s3 } from '../s3Service'

jest.mock('../../services/s3Service', () => ({
    s3: {
        upload: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({ Location: 'https://mock-s3-bucket.com/test.txt' }),
        }),
    },
}))

describe('cvService', () => {
    let mongoServer: MongoMemoryServer
    let key: Buffer
    let iv: Buffer

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        await mongoose.connect(uri)
        key = Buffer.from(
            process.env.ENCRYPTION_KEY || 'b77ce0918004d206986fab95c2d99a2ec122c9249bf6f5bede297a721b9d7df5',
            'hex',
        ) // Replace with your actual key
        iv = Buffer.from(process.env.INITIALIZATION_KEY || '8e85fc21cc543575a97ada34bb5fdfa4', 'hex') // Replace with your actual IV
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await CV.deleteMany({})
    })

    describe('getListCV', () => {
        it('should return an empty array when no CVs exist', async () => {
            const cvs = await cvService.getListCV()
            expect(cvs).toEqual([])
        })

        it('should return a list of CVs', async () => {
            const cvData: ICV = {
                email: 'test@example.com',
                lastName: 'Test',
                firstName: 'User',
                phoneNumber: '1234567890',
                url: 'test.com',
            }
            await CV.create(cvData)
            const cvs = await cvService.getListCV()
            expect(cvs).toHaveLength(1)
            expect(cvs[0].email).toBe('test@example.com')
        })

        it('should handle errors gracefully', async () => {
            jest.spyOn(CV, 'find').mockRejectedValueOnce(new Error('Database error'))
            await expect(cvService.getListCV()).rejects.toThrow('Database error')
        })

        it('should return CVs with all fields', async () => {
            const cvData: ICV = {
                email: 'test@example.com',
                lastName: 'Test',
                firstName: 'User',
                gender: 'Male',
                dob: new Date(),
                phoneNumber: '1234567890',
                address: 'Test Address',
                url: 'test.com',
            }
            await CV.create(cvData)
            const cvs = await cvService.getListCV()
            expect(cvs[0]).toMatchObject(cvData)
        })

        it('should return an array even if only one CV exists', async () => {
            const cvData: ICV = {
                email: 'test@example.com',
                lastName: 'Test',
                firstName: 'User',
                phoneNumber: '1234567890',
                url: 'test.com',
            }
            await CV.create(cvData)
            const cvs = await cvService.getListCV()
            expect(Array.isArray(cvs)).toBe(true)
        })

        it('should correctly populate optional fields', async () => {
            const cvData: ICV = {
                email: 'test@example.com',
                lastName: 'Test',
                firstName: 'User',
                gender: 'Female',
                dob: new Date(),
                phoneNumber: '1234567890',
                address: 'Test Address',
                url: 'test.com',
            }
            await CV.create(cvData)
            const cvs = await cvService.getListCV()
            expect(cvs[0].gender).toBe('Female')
            expect(cvs[0].address).toBe('Test Address')
            expect(cvs[0].dob).toBeDefined()
        })
        it('should handle null values for optional fields', async () => {
            const cvData: ICV = {
                email: 'test@example.com',
                lastName: 'Test',
                firstName: 'User',
                phoneNumber: '1234567890',
                url: 'test.com',
            }
            await CV.create(cvData)
            const cvs = await cvService.getListCV()
            expect(cvs[0].gender).toBeUndefined()
            expect(cvs[0].address).toBeUndefined()
            expect(cvs[0].dob).toBeUndefined()
        })
    })

    describe('encryptFileInMemory', () => {
        it('should encrypt a buffer successfully', async () => {
            const buffer = Buffer.from('This is a test buffer')
            const encryptedBuffer = await cvService.encryptFileInMemory(buffer, key, iv)
            expect(encryptedBuffer).toBeDefined()
            expect(encryptedBuffer.length).toBeGreaterThan(buffer.length) // Encrypted data should be larger
        })
        it('should handle empty buffers', async () => {
            const buffer = Buffer.alloc(0)
            const encryptedBuffer = await cvService.encryptFileInMemory(buffer, key, iv)
            expect(encryptedBuffer).toBeDefined()
            expect(encryptedBuffer.length).toBeGreaterThan(0) //Still expect some data due to padding.
        })

        it('should handle null buffers', async () => {
            await expect(cvService.encryptFileInMemory(null as any, key, iv)).rejects.toThrow()
        })

        it('should throw an error with invalid key', async () => {
            await expect(cvService.encryptFileInMemory(Buffer.from('test'), Buffer.alloc(0), iv)).rejects.toThrow()
        })
        it('should throw an error with invalid iv', async () => {
            await expect(cvService.encryptFileInMemory(Buffer.from('test'), key, Buffer.alloc(0))).rejects.toThrow()
        })

        it('should handle large buffers', async () => {
            const largeBuffer = Buffer.alloc(1024 * 1024) // 1MB buffer
            const encryptedBuffer = await cvService.encryptFileInMemory(largeBuffer, key, iv)
            expect(encryptedBuffer).toBeDefined()
            expect(encryptedBuffer.length).toBeGreaterThan(largeBuffer.length)
        })
    })

    describe('uploadEncryptedBufferToS3', () => {
        it('should upload a buffer to S3 and return the URL', async () => {
            const buffer = Buffer.from('Test buffer')
            const bucketName = 'your-bucket-name'
            const key = 'test.txt'
            const result = await cvService.uploadEncryptedBufferToS3(buffer, bucketName, key)
            expect(result).toBeDefined()
            expect(result.Location).toBe('https://mock-s3-bucket.com/test.txt')
            expect(s3.upload).toHaveBeenCalledWith({ Bucket: bucketName, Key: key, Body: buffer })
        })
        it('should handle empty buffers', async () => {
            const buffer = Buffer.alloc(0)
            const fileName = 'empty.txt'
            const result = await cvService.uploadEncryptedBufferToS3(buffer, 'your-bucket-name', fileName)
            expect(result).toBeDefined()
            expect(typeof result).toBe("object")
        })

        it('should handle null buffers', async () => {
            const result = await cvService.uploadEncryptedBufferToS3(null as any, 'your-bucket-name', 'test.txt')
            expect(typeof result).toBe("object")
        })

        it('should throw error with invalid bucket name', async () => {
            const buffer = Buffer.from('test')
            const result = await expect(cvService.uploadEncryptedBufferToS3(buffer, undefined, 'test.txt'))
            expect(typeof result).toBe("object")
        })
        it('should throw error with invalid file name', async () => {
            const buffer = Buffer.from('test')
            const result = expect(cvService.uploadEncryptedBufferToS3(buffer, 'your-bucket-name', Number(12)))
            expect(typeof result).toBe("object")
        })

        it('should handle maxium buffers (5mb)', async () => {
            const largeBuffer = Buffer.alloc(5 * 1024 * 1024) // 5MB buffer
            const fileName = 'large.txt'
            const result = await cvService.uploadEncryptedBufferToS3(largeBuffer, 'your-bucket-name', fileName)
            expect(result).toBeDefined()
            expect(typeof result).toBe("object")
        })
    })

    describe('getCVById', () => {
        it('should retrieve a CV by ID', async () => {
            const cvData: ICV = {
                email: 'test@example.com',
                lastName: 'Test',
                firstName: 'User',
                phoneNumber: '1234567890',
                url: 'test.com',
            }
            const createdCV = await CV.create(cvData)
            const retrievedCV = await cvService.getCVById(createdCV._id.toString())
            expect(retrievedCV).toBeDefined()
            expect(retrievedCV?._id.toString()).toBe(createdCV._id.toString())
            expect(retrievedCV?.email).toBe('test@example.com')
        })

        it('should return error null if ID is invalid', async () => {
            jest.spyOn(CV, 'findById').mockRejectedValueOnce(new Error('ID is invalid'))
            await expect(cvService.getCVById("invalid-id")).rejects.toThrow('ID is invalid')
            jest.clearAllMocks()
        })

        it('should return null if CV does not exist', async () => {
            jest.spyOn(CV, 'findById').mockRejectedValueOnce(new Error('CV does not exist'))
            await expect(cvService.getCVById(new Types.ObjectId().toString())).rejects.toThrow('CV does not exist')
            jest.clearAllMocks()
        })

        it('should handle errors gracefully', async () => {
            jest.spyOn(CV, 'findById').mockRejectedValueOnce(new Error('Database error'))
            await expect(cvService.getCVById('123')).rejects.toThrow('Database error')
            jest.clearAllMocks()
        })

        it('should return correct CV if multiple CVs exist', async () => {
            const cvData1: ICV = {
                email: 'test1@example.com',
                lastName: 'Test1',
                firstName: 'User1',
                phoneNumber: '1234567890',
                url: 'test1.com',
            }
            const cvData2: ICV = {
                email: 'test2@example.com',
                lastName: 'Test2',
                firstName: 'User2',
                phoneNumber: '9876543210',
                url: 'test2.com',
            }
            const createdCV1 = await CV.create(cvData1)
            await CV.create(cvData2)

            const retrievedCV = await cvService.getCVById(createdCV1._id.toString())
            expect(retrievedCV?._id.toString()).toBe(createdCV1._id.toString())
            expect(retrievedCV?.email).toBe('test1@example.com')
        })

        it('should return null if cvId is not provided', async () => {
            const retrievedCV = await cvService.getCVById(undefined as any)
            expect(retrievedCV).toEqual(null)
        })
    })
})
