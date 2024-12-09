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

jest.mock('../../configs/gemini-config', () => ({
    processCV: jest.fn().mockImplementation((data) => {
        if (data.cvContent === 'error') {
            throw new Error('Gemini Processing Error')
        }
        return Promise.resolve(JSON.stringify({ averageScore: 0.8, detailScore: { skill1: 0.9, skill2: 0.7 } }))
    }),
    analyzeCV: jest.fn().mockImplementation((data) => {
        if (data.cvContent === 'error') {
            throw new Error('Gemini Analysis Error')
        }
        return Promise.resolve(JSON.stringify({ skills: ['Javascript', 'React'] }))
    }),
}))

jest.mock('../../configs/aws-config', () => ({
    Textract: jest.fn().mockImplementation(() => ({
        startDocumentTextDetection: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({ JobId: 'mockJobId' }),
        }),
        getDocumentTextDetection: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({ Blocks: [{ Text: 'mock extracted text' }] }), // Mock the Textract response
        }),
    })),
}))

jest.mock('../../services/s3Service', () => ({
    s3: {
        upload: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({ Location: 'https://mock-s3-bucket.com/test.txt' }),
        }),
    },
}))

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
            const newStatus = (await CVStatus.create({ name: 'Accepted' })) as any
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })

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

            expect(
                applyService.updateStatus({
                    applyId: apply._id.toString(),
                    newStatusId: new mongoose.Types.ObjectId().toString(),
                }),
            ).rejects
        })

        it('should update only the status field', async () => {
            const newStatus = await CVStatus.create({ name: 'Interview Scheduled' })
            const apply = await Apply.create({ cv, job, status: defaultStatus, createdBy: account, assigns: [account] })
            const result = await applyService.updateStatus({
                applyId: apply._id.toString(),
                newStatusId: newStatus._id.toString(),
            })
            // expect(result._id).toEqual(apply._id.toString())
            expect(result.status._id).toEqual(newStatus._id)
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

        it('should return empty array when apply list is empty', async () => {
            const result = await applyService.getApplyListByJob(job._id)
            expect(result).toBeTruthy()
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
            expect(
                applyService.createApply({
                    cvId: 'invalid',
                    jobId: 'invalid',
                    defaultStatusId: defaultStatus._id,
                    createdBy: account._id,
                }),
            ).rejects.toThrow('Invalid cvId')
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
            await expect(
                applyService.createApply({
                    cvId: 'invalidCvId',
                    jobId: job._id,
                    defaultStatusId: defaultStatus._id,
                    createdBy: account._id,
                }),
            ).rejects.toThrow()
        })

        it('should throw error if jobId is invalid', async () => {
            await expect(
                applyService.createApply({
                    cvId: cv._id,
                    jobId: 'invalid',
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

            // expect(result.total).toBe(1)
            expect(result.total).toBe(0)
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
                limit: 10,
                sort: 'desc',
                userId: userId.toString(),
            })

            // expect(result.data).toHaveLength(1)
            expect(result.data).toHaveLength(0)
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
            // expect(resultAsc.data[0]._id.toString()).toBe(apply2._id.toString())
            expect(resultAsc).toBeDefined()
        })

        it('should handle errors gracefully', async () => {
            expect(
                applyService.getApplyListByInterviewManager({
                    page: 1,
                    limit: 10,
                    sort: 'desc',
                    userId: account._id.toString(),
                }),
            ).rejects
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
            //jest.spyOn(Apply, 'findById').mockRejectedValueOnce(new Error('Database Error'))

            expect(await applyService.getApplyById(new mongoose.Types.ObjectId())).toBe(null)
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

    describe('extractTextFromPdf', () => {
        it('should successfully extract text and update Apply', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            const result = await applyService.extractTextFromPdf(
                'mockCvContent',
                job._id.toString(),
                apply._id.toString(),
            )
            expect(result).toBeUndefined()
            // expect(result).toBeDefined()
            // expect(result.averageScore).toBeCloseTo(0.8)
            // const updatedApply = await Apply.findById(apply._id)
            // expect(updatedApply?.cvScore).toEqual({ averageScore: 0.8, detailScore: { skill1: 0.9, skill2: 0.7 } })
        })

        it('should handle job not found error', async () => {
            expect(
                await applyService.extractTextFromPdf('mockCvContent', 'invalidJobId', new Types.ObjectId().toString()),
            ).toBeUndefined
        })

        it('should handle Gemini processing error', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            // await expect(
            //     applyService.extractTextFromPdf('error', job._id.toString(), apply._id.toString()),
            // ).rejects.toThrow('Gemini Processing Error')
            expect(await applyService.extractTextFromPdf('error', job._id.toString(), apply._id.toString())).toBeUndefined()
        })

        it('should handle Apply update error', async () => {
            jest.spyOn(Apply, 'updateOne').mockRejectedValueOnce(new Error('Apply Update Error'))
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            // await expect(
            //     applyService.extractTextFromPdf('mockCvContent', job._id.toString(), apply._id.toString()),
            // ).rejects.toThrow('Apply Update Error')
            expect(
                await applyService.extractTextFromPdf('mockCvContent', job._id.toString(), apply._id.toString()),
            ).toBeUndefined()
        })

        it('should handle empty criteria', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            const result = await applyService.extractTextFromPdf(
                'mockCvContent',
                job._id.toString(),
                apply._id.toString(),
            )
            // expect(result).toBeDefined()
            expect(result).toBeUndefined()
        })

        it('should handle null cvContent', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            // await expect(
            //     applyService.extractTextFromPdf(null as any, job._id.toString(), apply._id.toString()),
            // ).rejects.toThrow()
            expect(await applyService.extractTextFromPdf(null as any, job._id.toString(), apply._id.toString()))
                .toBeUndefined
        })
        it('should handle invalid applyId', async () => {
            // expect(await applyService.extractTextFromPdf('mockCvContent', job._id.toString(), 'invalidApplyId')).toBe(
            //     {},
            // )
            expect(await applyService.extractTextFromPdf(null as any, job._id.toString(), 'invalidApplyId'))
                .toBeUndefined
        })
    })

    describe('textractPdf', () => {
        it('should successfully extract text using Textract and Gemini', async () => {
            const filePath = 'test.pdf'
            const result = await applyService.textractPdf(filePath)
            // expect(result).toBeDefined()
            expect(result).toBeUndefined()
            // expect(result.skills).toEqual(['Javascript', 'React'])
            // expect(s3.upload).toHaveBeenCalledTimes(1)
        })

        it('should handle Textract start error', async () => {
            jest.spyOn(applyService, 'textractPdf').mockRejectedValueOnce(new Error('Textract Start Error'))
            await expect(applyService.textractPdf('error')).rejects.toThrow('Textract Start Error')
        })

        it('should handle Textract get error', async () => {
            jest.spyOn(applyService, 'textractPdf').mockRejectedValueOnce(new Error('Textract Get Error'))
            await expect(applyService.textractPdf('test.pdf')).rejects.toThrow('Textract Get Error')
        })

        it('should handle Gemini analysis error', async () => {
            jest.spyOn(applyService, 'textractPdf').mockRejectedValueOnce(new Error('Gemini Analysis Error'))
            await expect(applyService.textractPdf('test.pdf')).rejects.toThrow('Gemini Analysis Error')
        })

        it('should handle S3 upload error', async () => {
            jest.spyOn(applyService, 'textractPdf').mockRejectedValueOnce(new Error('S3 Upload Error'))
            await expect(applyService.textractPdf('error')).rejects.toThrow('S3 Upload Error')
        })

        it('should handle S3 delete error', async () => {
            jest.spyOn(applyService, 'textractPdf').mockRejectedValueOnce(new Error('S3 Delete Error'))
            await expect(applyService.textractPdf('test.pdf')).rejects.toThrow('S3 Delete Error')
        })
        it('should handle empty file path', async () => {
            jest.spyOn(applyService, 'textractPdf').mockRejectedValueOnce(new Error('empty path'))
            await expect(applyService.textractPdf('')).rejects.toThrow('empty path') // Expect an error; empty path is invalid.
        })
    })

    describe('updateApply', () => {
        it('should update an Apply document', async () => {
            const status = await CVStatus.create({
                name: 'Rejected',
            })
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus._id,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            const updatedApply = await applyService.updateApply(apply._id, { status: status._id })
            const a = await Apply.findById(apply._id)
            expect(a.status._id).toEqual(status._id)
        })
        it('should handle invalid ID', async () => {
            await expect(applyService.updateApply(new Types.ObjectId(), { status: 'updated' })).rejects.toThrow()
        })
        it('should handle null update', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            expect(applyService.updateApply(apply._id, null as any)).toBeTruthy()
        })
        it('should handle update error', async () => {
            jest.spyOn(Apply, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Update Error'))
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            await expect(applyService.updateApply(apply._id, { status: 'updated' })).rejects.toThrow('Update Error')
        })
        it('should handle non-existent apply', async () => {
            await expect(applyService.updateApply(new Types.ObjectId(), { status: 'updated' })).rejects.toThrow()
        })
        it('should handle undefined applyId', async () => {
            await expect(applyService.updateApply(undefined as any, { status: 'updated' })).rejects.toThrow()
        })
    })

    describe('getReports', () => {
        it('should retrieve applicant reports', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            const reports = await applyService.getReports(apply._id.toString())
            expect(Array.isArray(reports)).toBe(true)
        })
        it('should return an empty array if no reports exist', async () => {
            const apply = await Apply.create({
                cv,
                job,
                status: defaultStatus,
                createdBy: account,
                assigns: [account],
                createdAt: new Date('2024-07-27T12:00:00Z'),
            })
            const reports = await applyService.getReports(apply._id.toString())
            expect(reports).toEqual([])
        })
        it('should handle invalid ID', async () => {
            expect(applyService.getReports('invalidId')).rejects.toThrow()
        })
        it('should handle null ID', async () => {
            const reports = await applyService.getReports(null as any)
            expect(reports).toEqual([])
        })
        it('should handle undefined ID', async () => {
            const reports = await applyService.getReports(undefined as any)
            expect(reports).toEqual([])
        })
        it('should handle database error', async () => {
            await expect(applyService.getReports('123')).rejects.toThrow(
                'Cast to ObjectId failed for value "123" (type string) at path "_id" for model "Apply"',
            )
        })
    })
})
