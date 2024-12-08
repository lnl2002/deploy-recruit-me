import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Apply from '../../models/applyModel'
import Job from '../../models/jobModel'
import CV from '../../models/cvModel'
import CVStatus from '../../models/cvStatusModel'
import ApplicantReport from '../../models/applicantReportModel'
import Criteria from '../../models/criteriaModel'
import applyService from '../apply'
import Account from '../../models/accountModel'
import Role from '../../models/roleModel'

// Mock external dependencies (AWS, Gemini, utils)
jest.mock('../../configs/aws-config')
jest.mock('../../configs/gemini-config')
jest.mock('../../utils/uploadPdfToS3')

describe('applyService', () => {
    let mongoServer: MongoMemoryServer
    let defaultStatus
    let job
    let cv
    let account
    let criteria
    let report

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        await mongoose.connect(uri)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await Apply.deleteMany({})
        await Job.deleteMany({})
        await CV.deleteMany({})
        await CVStatus.deleteMany({})
        await Account.deleteMany({})
        await ApplicantReport.deleteMany({})
        await Criteria.deleteMany({})

        criteria = (await Criteria.create({
            name: 'test',
        })) as any
        defaultStatus = (await CVStatus.create({
            name: 'Shortlist',
        })) as any
        job = await Job.create({
            _id: new mongoose.Types.ObjectId(),
            title: 'Software Engineer',
            introduction: 'Join our dynamic team as a Software Engineer.',
            description: 'You will be responsible for developing and maintaining software applications.',
            benefits: 'Health insurance, 401(k), and flexible working hours.',
            requests: "Bachelor's degree in Computer Science or related field.",
            minSalary: 60000,
            maxSalary: 120000,
            numberPerson: 3,
            unit: new mongoose.Types.ObjectId(),
            career: new mongoose.Types.ObjectId(),
            account: new mongoose.Types.ObjectId(),
            interviewManager: new mongoose.Types.ObjectId(),
            location: new mongoose.Types.ObjectId(),
            criterias: [criteria._id],
            address: '123 Main St, Anytown, USA',
            timestamp: new Date(),
            expiredDate: new Date('2025-12-31'),
            startDate: new Date('2025-01-01'),
            isDelete: false,
            isActive: true,
            type: 'fulltime',
            status: 'pending',
            rejectReason: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        cv = (await CV.create({
            _id: new mongoose.Types.ObjectId(),
            email: 'john.doe@example.com',
            lastName: 'Doe',
            firstName: 'John',
            gender: 'Male',
            dob: new Date('1990-01-01'),
            phoneNumber: '123-456-7890',
            address: '123 Main St, Anytown, USA',
            url: 'https://example.com/johndoe_cv.pdf',
        })) as any
        const role = await Role.create({ roleName: 'Admin' })
        const mockDetailCriteria = {
            criteriaName: 'Technical Skills',
            comment: 'Excellent understanding of algorithms and data structures.',
        }
        account = (await Account.create({ name: 'John Doe', email: 'john@example.com', role: role._id })) as any

        report = (await ApplicantReport.create({
            _id: account._id,
            details: [mockDetailCriteria],
            createdBy: new mongoose.Types.ObjectId(),
            score: 85,
            isPass: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })) as any
    })

    describe('updateStatus', () => {
        it('should update the status of an apply', async () => {
            const newStatus = (await CVStatus.create({name: "Accepted"})) as any
            const apply = await Apply.create({ cv, job, status: defaultStatus, createdBy: account, assigns: [account] })

            const updatedApply = await applyService.updateStatus({
                applyId: apply._id.toString(),
                newStatusId: newStatus._id.toString(),
            })

            expect(updatedApply?.status.toString()).toBeTruthy()
        })

        // at least 6 test cases

        it('should return null if applyId is not found', async () => {
            const updatedApply = await applyService.updateStatus({
                applyId: new Types.ObjectId().toString(),
                newStatusId: new Types.ObjectId().toString(),
            })

            expect(updatedApply).toBeNull()
        })

        it('should return null if newStatusId is invalid', async () => {
            const apply = await Apply.create({ cv, job, status: defaultStatus, createdBy: account, assigns: [account] })

            const updatedApply = await applyService.updateStatus({
                applyId: apply._id.toString(),
                newStatusId: 'invalid-status-id',
            })

            expect(updatedApply).toBeNull()
        })

        it('should update only the status field', async () => {
            const newStatus = (await CVStatus.create({name:"Interview Scheduled"})) as any
            const apply = await Apply.create({ cv, job, status: defaultStatus, createdBy: account, assigns: [account] })

            const updatedApply = await applyService.updateStatus({
                applyId: apply._id.toString(),
                newStatusId: newStatus._id.toString(),
            })

            expect(updatedApply?.cv.toString()).toBe(apply.cv.toString())
        })

        it('should throw an error if applyId is invalid', async () => {
            await expect(
                applyService.updateStatus({ applyId: 'invalidId', newStatusId: 'newStatusId' }),
            ).rejects.toThrowError()
        })

        it('should handle database errors gracefully', async () => {
            const applyId = new mongoose.Types.ObjectId()
            const newStatusId = new mongoose.Types.ObjectId()

            jest.spyOn(Apply, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Database error'))

            await expect(
                applyService.updateStatus({ applyId: applyId.toString(), newStatusId: newStatusId.toString() }),
            ).rejects.toThrowError('Database error')
        })

        it('should update the status of the correct apply', async () => {
            const newStatus = (await CVStatus.create({ name: 'Interview Scheduled' })) as any
            const apply1 = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
            })
            const apply2 = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
            })

            const updatedApply = await applyService.updateStatus({
                applyId: apply1._id.toString(),
                newStatusId: newStatus._id.toString(),
            })

            expect(updatedApply?.status.toString()).toBe(newStatus._id.toString())

            const unchangedApply = await Apply.findById(apply2._id)
            expect(unchangedApply?.status.toString()).toBe(defaultStatus._id.toString())
        })
    })

    describe('getApplyListByJob', () => {
        it('should return an empty array if no applies exist for the given job', async () => {
            const applies = await applyService.getApplyListByJob(job._id)
            expect(applies).toEqual([])
        })

        it('should return applies for the specified job', async () => {
            const apply = await Apply.create({ cv, job, status: defaultStatus, createdBy: account, assigns: [account] })

            const applies = await applyService.getApplyListByJob(job._id)

            expect(applies).toHaveLength(1)
        })

        it('should populate the cv, job, status, and assigns fields', async () => {
            const apply = await Apply.create({ cv, job, status: defaultStatus, createdBy: account, assigns: [account] })

            const applies = await applyService.getApplyListByJob(job._id)

            expect(applies[0].cv).toBeDefined()
            expect(applies[0].job).toBeDefined()
            expect(applies[0].status).toBeDefined()
        })

        it('should handle errors gracefully', async () => {
            jest.spyOn(Apply, 'find').mockRejectedValueOnce(new Error('Database error'))

            await expect(applyService.getApplyListByJob(job._id)).rejects.toThrowError('Database error')
        })

        it('should return applies in the correct order', async () => {
            const apply1 = (await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-26T12:00:00Z'),
            })) as any
            const apply2 = (await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })) as any

            const applies = await applyService.getApplyListByJob(job._id)

            expect(applies[0]._id.toString()).toBe(apply1._id.toString())
            expect(applies[1]._id.toString()).toBe(apply2._id.toString())
        })

        it('should return an array of IApply objects', async () => {
            await Apply.create({ cv, job, status: defaultStatus, createdBy: account, assigns: [account] })

            const applies = await applyService.getApplyListByJob(job._id)

            expect(applies).toBeInstanceOf(Array)
            expect(applies[0]).toBeInstanceOf(Object)
        })
    })

    describe('createApply', () => {
        it('should create a new application successfully', async () => {
            const newApply = await applyService.createApply({
                cvId: cv._id,
                jobId: job._id,
                defaultStatusId: defaultStatus._id,
                createdBy: account._id,
            })

            expect(newApply).toBeDefined()
            expect(newApply.cv.toString()).toBe(cv._id.toString())
        })

        it('should handle errors during apply creation', async () => {
            await expect(
                applyService.createApply({
                    cvId: cv._id,
                    jobId: job._id,
                    defaultStatusId: defaultStatus._id,
                    createdBy: account._id,
                }),
            ).rejects.toThrow('Database error')
        })

        it('should create apply with correct data', async () => {
            const newApply = await applyService.createApply({
                cvId: cv._id,
                jobId: job._id,
                defaultStatusId: defaultStatus._id,
                createdBy: account._id,
            })

            expect(newApply.job.toString()).toBe(job._id.toString())
            expect(newApply.status.toString()).toBe(defaultStatus._id.toString())
        })

        it('should save the new apply to the database', async () => {
            await applyService.createApply({
                cvId: cv._id,
                jobId: job._id,
                defaultStatusId: defaultStatus._id,
                createdBy: account._id,
            })

            const applyInDB = await Apply.findOne({ cv: cv._id, job: job._id })
            expect(applyInDB).not.toBeNull()
        })

        it('should throw an error if cvId is invalid', async () => {
            const invalidCvId = new Types.ObjectId()

            await expect(
                applyService.createApply({
                    cvId: invalidCvId,
                    jobId: job._id,
                    defaultStatusId: defaultStatus._id,
                    createdBy: account._id,
                }),
            ).rejects.toThrow()
        })

        it('should throw an error if jobId is invalid', async () => {
            const invalidJobId = new Types.ObjectId()

            await expect(
                applyService.createApply({
                    cvId: cv._id,
                    jobId: invalidJobId,
                    defaultStatusId: defaultStatus._id,
                    createdBy: account._id,
                }),
            ).rejects.toThrow()
        })
    })

    // ... (other test suites: getApplyListByInterviewManager, getApplyById, etc.)
    describe('getApplyListByInterviewManager', () => {
        it('should return an object with the correct structure', async () => {
            const result = await applyService.getApplyListByInterviewManager({
                page: 1,
                limit: 10,
                sort: 'desc',
                userId: account._id.toString(),
            })

            expect(result).toHaveProperty('total')
            expect(result).toHaveProperty('page')
        })

        it('should return the correct total number of applications', async () => {
            const userId = account._id

            await Apply.create({ cv, job, status: defaultStatus, createdBy: userId, interviewManager: userId })

            const result = await applyService.getApplyListByInterviewManager({
                page: 1,
                limit: 10,
                sort: 'desc',
                userId: userId.toString(),
            })

            expect(result.total).toBe(1)
        })

        it('should return the correct page number', async () => {
            const result = await applyService.getApplyListByInterviewManager({
                page: 2, // Set page to 2
                limit: 10,
                sort: 'desc',
                userId: account._id.toString(),
            })

            expect(result.page).toBe(2)
        })

        it('should paginate results correctly', async () => {
            const userId = account._id

            await Apply.create({ cv, job, status: defaultStatus, createdBy: userId, interviewManager: userId })
            await Apply.create({ cv, job, status: defaultStatus, createdBy: userId, interviewManager: userId })

            const result = await applyService.getApplyListByInterviewManager({
                page: 1,
                limit: 1,
                sort: 'desc',
                userId: userId.toString(),
            })

            expect(result.data).toHaveLength(1)
        })

        it('should sort results correctly', async () => {
            const userId = account._id

            const apply1 = (await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: userId,
                interviewManager: userId,
                createdAt: new Date('2024-07-28T10:00:00.000Z'),
            })) as any

            const apply2 = (await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: userId,
                interviewManager: userId,
                createdAt: new Date('2024-07-27T10:00:00.000Z'),
            })) as any

            const resultAsc = await applyService.getApplyListByInterviewManager({
                page: 1,
                limit: 10,
                sort: 'asc',
                userId: userId.toString(),
            })
            expect(resultAsc.data[0]._id.toString()).toBe(apply2._id.toString())
        })

        it('should handle errors gracefully', async () => {
            jest.spyOn(Apply, 'find').mockRejectedValueOnce(new Error('Database error'))

            await expect(
                applyService.getApplyListByInterviewManager({
                    page: 1,
                    limit: 10,
                    sort: 'desc',
                    userId: account._id.toString(),
                }),
            ).rejects.toThrow('Database error')
        })
    })

    describe('getApplyById', () => {
        it('should retrieve an apply by ID', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                applicantReports: report,
            })

            const retrievedApply = await applyService.getApplyById(apply._id)

            expect(retrievedApply).not.toBeNull()
            expect(retrievedApply?._id.toString()).toBe(apply._id.toString())
        })

        it('should return null if apply is not found', async () => {
            const retrievedApply = await applyService.getApplyById(new mongoose.Types.ObjectId())

            expect(retrievedApply).toBeNull()
        })

        it('should populate all fields correctly', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                applicantReports: report,
            })

            const retrievedApply = await applyService.getApplyById(apply._id)

            expect(retrievedApply?.cv).toBeDefined()
            expect(retrievedApply?.job).toBeDefined()
            expect(retrievedApply?.status).toBeDefined()
        })

        it('should handle errors gracefully', async () => {
            jest.spyOn(Apply, 'findById').mockRejectedValueOnce(new Error('Database Error'))

            await expect(applyService.getApplyById(new mongoose.Types.ObjectId())).rejects.toThrow('Database Error')
        })

        it('should retrieve the correct apply if multiple applies exist', async () => {
            const apply1 = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
            })
            await Apply.create({ cv, job, status: defaultStatus, createdBy: account, assigns: [account] })

            const retrievedApply = await applyService.getApplyById(apply1._id)

            expect(retrievedApply?._id.toString()).toBe(apply1._id.toString())
        })

        it('should return an IApply object', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                applicantReports: report,
            })

            const retrievedApply = await applyService.getApplyById(apply._id)

            expect(retrievedApply).toBeInstanceOf(Object)
        })
    })

    // ... (other test suites: extractTextFromPdf, textractPdf, etc.)
    describe('extractTextFromPdf', () => {
        it('should extract text from PDF and update cvScore', async () => {
            const job = await Job.create({ criterias: [criteria._id] })
            const apply = (await Apply.create({ job: job?._id, cv: cv?._id, status: defaultStatus?._id })) as any

            jest.spyOn(applyService as any, 'calculateAverageScore').mockReturnValue('8/10')

            const result = await (applyService as any).extractTextFromPdf(
                'pdfContent',
                job?._id.toString(),
                apply?._id.toString(),
            )

            expect(result).toBeDefined()

            const updatedApply = await Apply.findById(apply._id)
            expect(updatedApply?.cvScore?.averageScore).toBe('8/10')
        })

        it('should throw an error if job is not found', async () => {
            jest.spyOn(Job, 'findById').mockResolvedValue(null)

            await expect(
                (applyService as any).extractTextFromPdf('pdf content', 'Non-existent jobId', 'applyId'),
            ).rejects.toThrowError(/Job Non-existent jobId not found/)
        })

        it('should use Gemini to process the CV and criteria', async () => {
            const job = await Job.create({ criterias: [] })
            const apply = (await Apply.create({ job: job._id, cv: cv._id, status: defaultStatus._id })) as any

            const mockGemini = { processCV: jest.fn().mockResolvedValue('{"score": "5/5"}') }
            jest.spyOn(applyService as any, 'calculateAverageScore').mockReturnValue('10/10')

            await (applyService as any).extractTextFromPdf(
                'pdf content',
                job?._id.toString(),
                apply?._id.toString(),
                mockGemini as any,
            )

            expect(mockGemini.processCV).toHaveBeenCalledWith({
                cvContent: 'pdf content',
                criteriaContent: JSON.stringify([]),
            })
        })
    })

    describe('textractPdf', () => {
        it('should extract text from PDF using Textract and analyze with Gemini', async () => {
            require('../utils/uploadPdfToS3').uploadPdfToS3.mockResolvedValue('mockS3Key')

            require('../configs/aws-config').textract.startDocumentTextDetection.mockResolvedValue({
                JobId: 'mockTextractJobId',
            })

            require('../utils/uploadPdfToS3').pollTextractJob.mockResolvedValue('mockExtractedText')

            require('../utils/uploadPdfToS3').deleteS3File.mockResolvedValue({})

            const mockGeminiInstance = {
                analyzeCV: jest.fn().mockResolvedValue(JSON.stringify({ skills: ['JavaScript'] })),
            }
            jest.spyOn(applyService as any, 'calculateAverageScore')
            const mockGemini = jest.fn(() => mockGeminiInstance)

            const result = await applyService.textractPdf('mockFilePath')
            expect(result).toEqual({ skills: ['JavaScript'] })
        })

        it('should handle errors during PDF upload to S3', async () => {
            require('../utils/uploadPdfToS3').uploadPdfToS3.mockRejectedValue(new Error('S3 Upload Error'))

            await expect(applyService.textractPdf('filePath')).rejects.toThrow('S3 Upload Error')
        })

        it('should handle errors during Textract job start', async () => {
            require('../utils/uploadPdfToS3').uploadPdfToS3.mockResolvedValue('mockS3Key')

            require('../configs/aws-config').textract.startDocumentTextDetection.mockRejectedValue(
                new Error('Textract Start Error'),
            )

            await expect(applyService.textractPdf('filePath')).rejects.toThrow('Textract Start Error')
        })

        it('should handle errors during Textract job polling', async () => {
            require('../utils/uploadPdfToS3').uploadPdfToS3.mockResolvedValue('mockS3Key')

            require('../configs/aws-config').textract.startDocumentTextDetection.mockResolvedValue({
                JobId: 'mockTextractJobId',
            })

            require('../utils/uploadPdfToS3').pollTextractJob.mockRejectedValue(new Error('Textract Polling Error'))

            await expect(applyService.textractPdf('filePath')).rejects.toThrow('Textract Polling Error')
        })

        it('should delete the file from S3 after processing', async () => {
            const mockDeleteS3File = jest.fn().mockResolvedValue({})
            require('../utils/uploadPdfToS3').deleteS3File.mockImplementation(mockDeleteS3File)

            require('../utils/uploadPdfToS3').uploadPdfToS3.mockResolvedValue('mockS3key')
            require('../configs/aws-config').textract.startDocumentTextDetection.mockResolvedValue({
                JobId: 'mockTextractJobId',
            })
            require('../utils/uploadPdfToS3').pollTextractJob.mockResolvedValue('mockExtractedText')

            const mockGeminiInstance = {
                analyzeCV: jest.fn().mockResolvedValue('{}'),
            }
            const mockGemini = jest.fn(() => mockGeminiInstance)

            await applyService.textractPdf('filePath')

            expect(mockDeleteS3File).toHaveBeenCalledWith({ fileName: 'mockS3key' })
        })
    })
})
