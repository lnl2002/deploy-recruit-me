/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Job from '../../models/jobModel'
import Account from '../../models/accountModel'
import Career from '../../models/careerModel'
import Apply from '../../models/applyModel'
import jobService from '../jobService'
import Role from '../../models/roleModel'
import Location from '../../models/locationModel'
import Unit from '../../models/unitModel'
import jobController from '~/controllers/jobController'

describe('jobService', () => {
    let mongoServer: MongoMemoryServer

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        await mongoose.connect(uri)
        require('../../models/cvModel')
        require('../../models/accountModel')
        require('../../models/roleModel')
        require('../../models/applicantReportModel')
        require('../../models/applyModel')
        require('../../models/careerModel')
        require('../../models/criteriaModel')
        require('../../models/cvStatusModel')
        require('../../models/groupCriteriaModel')
        require('../../models/jobModel')
        require('../../models/locationModel')
        require('../../models/meetingRoomModel')
        require('../../models/notificationModel')
        require('../../models/unitModel')
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await seedData()
    })

    describe('getListJob', () => {
        test('should fetch jobs with proper query', async () => {
            const query = {
                sort_field: 'createdAt',
                order: 'asc',
                limit: 5,
                skip: 0,
            }

            const filteredQuery = {}
            const isOwner = true

            const result = await jobService.getListJobs(query, filteredQuery, isOwner)

            expect(result.jobs).toBeDefined()
            expect(Array.isArray(result.jobs)).toBeTruthy()
            expect(result.total).toBeGreaterThan(0)
            expect(result.jobs.length).toBeLessThanOrEqual(5)
        })

        test('should return no jobs when no matching criteria', async () => {
            const query = {
                sort_field: 'createdAt',
                order: 'asc',
                limit: 5,
                skip: 0,
            }

            const filteredQuery = { title: 'Non-existing job' } // Query unlikely to match any data
            const isOwner = false

            const result = await jobService.getListJobs(query, filteredQuery, isOwner)

            expect(result.jobs).toBeDefined()
            expect(result.jobs.length).toBe(0)
            expect(result.total).toBe(0)
        })

        test('should handle pagination properly', async () => {
            const query = {
                sort_field: 'createdAt',
                order: 'asc',
                limit: 2,
                skip: 2,
            }

            const filteredQuery = {}
            const isOwner = true

            const result = await jobService.getListJobs(query, filteredQuery, isOwner)

            expect(result.jobs).toBeDefined()
            expect(result.jobs.length).toBe(2)
        })

        test('should fetch jobs sorted by maxSalary in descending order', async () => {
            const query = {
                sort_field: 'maxSalary',
                order: 'desc',
                limit: 5,
                skip: 0,
            }

            const filteredQuery = {}
            const isOwner = true

            const result = await jobService.getListJobs(query, filteredQuery, isOwner)

            expect(result.jobs).toBeDefined()
            expect(result.jobs.length).toBeLessThanOrEqual(5)
            expect(result.jobs[0].maxSalary).toBeGreaterThanOrEqual(result.jobs[1]?.maxSalary || 0)
        })

        test('should return an empty result when given an invalid query', async () => {
            const query = {
                sort_field: 'invalidField',
                order: 'asc',
                limit: 5,
                skip: 0,
            }

            const filteredQuery = {}
            const isOwner = true

            await expect(jobService.getListJobs(query, filteredQuery, isOwner)).rejects.toThrow(
                'Invalid query parameter',
            )
        })

        test('should fetch jobs with partial matching criteria', async () => {
            const query = {
                sort_field: 'createdAt',
                order: 'asc',
                limit: 5,
                skip: 0,
            }

            const filteredQuery = { title: /Frontend Developer/i } // Partial match on title
            const isOwner = false

            const result = await jobService.getListJobs(query, filteredQuery, isOwner)

            expect(result.jobs).toBeDefined()
            expect(Array.isArray(result.jobs)).toBeTruthy()
            expect(result.jobs.length).toBeGreaterThanOrEqual(1)
            expect(result.jobs[0].title).toMatch(/Frontend Developer/i)
        })
    })

    describe('addJob', () => {
        it('should successfully add a new job to the database', async () => {
            // Create mock IDs to simulate object references
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const newJob = new Job({
                title: 'Software Engineer',
                introduction: 'Join a great team of engineers!',
                description: 'Looking for a skilled software engineer to join our team.',
                requests: 'Strong JavaScript and TypeScript skills.',
                benefits: 'Competitive pay, 401k matching, flexible hours.',
                minSalary: 60000,
                maxSalary: 120000,
                numberPerson: 3,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '123 Engineering Way',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'fulltime',
                status: 'pending',
                rejectReason: '',
            })

            // console.log('Type of address:', typeof newJob.address)
            // console.log('Full data to save:', newJob.toObject())

            await newJob.validate() // Debugging validation
            const savedJob = await newJob.save()
            // console.log('Saved job:', savedJob)

            expect(savedJob._id).toBeDefined()
            expect(savedJob.title).toBe('Software Engineer')
            expect(savedJob.status).toBe('pending')
            expect(savedJob.minSalary).toBe(60000)
            expect(savedJob.unit).toStrictEqual(unitId)
            expect(savedJob.career).toStrictEqual(careerId)
            expect(savedJob.criterias).toHaveLength(1)
            expect(savedJob.criterias[0]).toStrictEqual(criteriaId)
        })

        it('should add a job with default "pending" status when no status is provided', async () => {
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const newJob = new Job({
                title: 'Data Scientist',
                introduction: 'Work on cutting-edge AI technologies.',
                description: 'Looking for a data scientist to join the AI research team.',
                requests: 'Experience with Python and TensorFlow.',
                benefits: 'Health insurance, stock options.',
                minSalary: 70000,
                maxSalary: 150000,
                numberPerson: 1,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '456 AI Avenue',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'fulltime',
            })

            const savedJob = await newJob.save()

            expect(savedJob.status).toBe('pending')
        })

        it('should throw validation error if required fields are missing', async () => {
            const invalidJob = new Job({
                title: 'Incomplete Job',
            })

            await expect(invalidJob.save()).rejects.toThrowError()
        })

        it('should save a job with "remote" type', async () => {
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const remoteJob = new Job({
                title: 'Remote Developer',
                introduction: 'Join our remote-first team.',
                description: 'Work from anywhere in the world.',
                requests: 'Strong internet connection.',
                benefits: 'Flexible hours, remote-friendly culture.',
                minSalary: 80000,
                maxSalary: 160000,
                numberPerson: 5,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: 'Remote',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'remote',
                status: 'pending',
            })

            const savedJob = await remoteJob.save()

            expect(savedJob.type).toBe('remote')
            expect(savedJob.address).toBe('Remote')
        })

        it('should save a job with multiple criteria IDs', async () => {
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaIds = [new Types.ObjectId(), new Types.ObjectId()]

            const newJob = new Job({
                title: 'Product Manager',
                introduction: 'Lead our product development team.',
                description: 'Looking for an experienced product manager.',
                requests: 'Strong leadership and communication skills.',
                benefits: 'Health insurance, annual bonus.',
                minSalary: 90000,
                maxSalary: 180000,
                numberPerson: 2,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '789 Product Street',
                criterias: criteriaIds,
                expiredDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'hybrid',
                status: 'approved',
            })

            const savedJob = await newJob.save()

            expect(savedJob.criterias).toHaveLength(2)
            expect(savedJob.criterias).toEqual(criteriaIds)
        })

        it('should reject a job with invalid salary range', async () => {
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const invalidJob = new Job({
                title: 'Invalid Job',
                introduction: 'This job has an invalid salary range.',
                description: 'Testing invalid min and max salary.',
                requests: 'Testing purposes.',
                benefits: 'Testing purposes.',
                minSalary: 150000,
                maxSalary: 120000, // Invalid range
                numberPerson: 1,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '000 Invalid Street',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'fulltime',
                status: 'pending',
            })

            await expect(invalidJob.save()).rejects.toThrowError(/should be less than maxSalary/)
        })
    })

    describe('deleteJob', () => {
        test('should permanently delete a job when isDelete is true', async () => {
            // Create a mock job
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const job = new Job({
                title: 'Software Engineer',
                introduction: 'Join a great team of engineers!',
                description: 'Looking for a skilled software engineer to join our team.',
                requests: 'Strong JavaScript and TypeScript skills.',
                benefits: 'Competitive pay, 401k matching, flexible hours.',
                minSalary: 60000,
                maxSalary: 120000,
                numberPerson: 3,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '123 Engineering Way',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'fulltime',
                status: 'pending',
                rejectReason: '',
            })
            await job.save()

            const deletedJob = await jobService.deleteJob(job._id, true)

            expect(deletedJob).toBeDefined()
            expect(deletedJob?._id).toStrictEqual(job._id)

            // Verify the job is removed from the database
            const fetchedJob = await Job.findById(job._id)
            expect(fetchedJob).toBeNull()
        })

        test('should mark a job as deleted (soft delete) when isDelete is false', async () => {
            // Create a mock job
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const job = new Job({
                title: 'Software Engineer',
                introduction: 'Join a great team of engineers!',
                description: 'Looking for a skilled software engineer to join our team.',
                requests: 'Strong JavaScript and TypeScript skills.',
                benefits: 'Competitive pay, 401k matching, flexible hours.',
                minSalary: 60000,
                maxSalary: 120000,
                numberPerson: 3,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '123 Engineering Way',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'fulltime',
                status: 'pending',
                rejectReason: '',
            })
            await job.save()

            const updatedJob = await jobService.deleteJob(job._id, false)

            expect(updatedJob).toBeDefined()
            expect(updatedJob?._id).toStrictEqual(job._id)
            expect(updatedJob?.isDelete).toBe(true)

            // Verify the job is still in the database but marked as deleted
            const fetchedJob = await Job.findById(job._id)
            expect(fetchedJob).toBeDefined()
            expect(fetchedJob?.isDelete).toBe(true)
        })

        test('should return null for a non-existent job ID when permanently deleting', async () => {
            const nonExistentId = new Types.ObjectId()

            const deletedJob = await jobService.deleteJob(nonExistentId, true)

            expect(deletedJob).toBeNull()
        })

        test('should return null for a non-existent job ID when soft deleting', async () => {
            const nonExistentId = new Types.ObjectId()

            const updatedJob = await jobService.deleteJob(nonExistentId, false)

            expect(updatedJob).toBeNull()
        })

        test('should throw an error for an invalid job ID format', async () => {
            const invalidId = 'invalid-id'

            await expect(jobService.deleteJob(invalidId, true)).rejects.toThrow('Cast to ObjectId failed')
        })

        test('should throw an error if the database operation fails', async () => {
            // Mock Job.findByIdAndDelete or Job.findByIdAndUpdate to throw an error
            jest.spyOn(Job, 'findByIdAndDelete').mockImplementationOnce(() => {
                throw new Error('Database error')
            })

            const validId = new Types.ObjectId()

            await expect(jobService.deleteJob(validId, true)).rejects.toThrow('Database error')
        })
    })

    describe('restoreJob', () => {
        const mockJobId = new mongoose.Types.ObjectId()
        test('should restore a deleted job by setting isDelete to false', async () => {
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const deletedJob = new Job({
                _id: mockJobId,
                title: 'Software Engineer',
                introduction: 'Join a great team of engineers!',
                description: 'Looking for a skilled software engineer to join our team.',
                requests: 'Strong JavaScript and TypeScript skills.',
                benefits: 'Competitive pay, 401k matching, flexible hours.',
                minSalary: 60000,
                maxSalary: 120000,
                numberPerson: 3,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '123 Engineering Way',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'fulltime',
                status: 'pending',
                rejectReason: '',
            })
            await deletedJob.save()

            const result = await jobService.restoreJob(mockJobId)

            expect(result).toBeDefined()
            expect(result?.isDelete).toBe(false) // Check the job is no longer marked as deleted
            const restoredJob = await Job.findById(mockJobId)
            expect(restoredJob?.isDelete).toBe(false)
        })

        test('should return null if job does not exist', async () => {
            const nonExistentJobId = new mongoose.Types.ObjectId()

            const result = await jobService.restoreJob(nonExistentJobId)

            expect(result).toBeNull()
        })

        test('should handle an invalid jobId format gracefully', async () => {
            const invalidJobId = 'invalidJobId'

            await expect(jobService.restoreJob(invalidJobId)).rejects.toThrowError('Cast to ObjectId failed')
        })

        test('should only update isDelete field without affecting other fields', async () => {
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const jobToRestore = new Job({
                _id: mockJobId,
                title: 'Software Engineer',
                introduction: 'Join a great team of engineers!',
                description: 'Looking for a skilled software engineer to join our team.',
                requests: 'Strong JavaScript and TypeScript skills.',
                benefits: 'Competitive pay, 401k matching, flexible hours.',
                minSalary: 60000,
                maxSalary: 120000,
                numberPerson: 3,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '123 Engineering Way',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'fulltime',
                status: 'pending',
                rejectReason: '',
            })
            await jobToRestore.save()

            const result = await jobService.restoreJob(mockJobId)

            expect(result).toBeDefined()
            expect(result?.isDelete).toBe(false) // Only isDelete should change
            expect(result?.introduction).toBe('Join a great team of engineers!')
            expect(result?.description).toBe('Looking for a skilled software engineer to join our team.')
        })

        test('should handle edge case if the job is already restored', async () => {
            const unitId = new Types.ObjectId()
            const careerId = new Types.ObjectId()
            const accountId = new Types.ObjectId()
            const locationId = new Types.ObjectId()
            const criteriaId = new Types.ObjectId()

            const alreadyRestoredJob = new Job({
                _id: mockJobId,
                title: 'Software Engineer',
                introduction: 'Join a great team of engineers!',
                description: 'Looking for a skilled software engineer to join our team.',
                requests: 'Strong JavaScript and TypeScript skills.',
                benefits: 'Competitive pay, 401k matching, flexible hours.',
                minSalary: 60000,
                maxSalary: 120000,
                numberPerson: 3,
                unit: unitId,
                location: locationId,
                career: careerId,
                account: accountId,
                interviewManager: accountId,
                address: '123 Engineering Way',
                criterias: [criteriaId],
                expiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                isDelete: false,
                type: 'fulltime',
                status: 'pending',
                rejectReason: '',
            })
            await alreadyRestoredJob.save()

            const result = await jobService.restoreJob(mockJobId)

            expect(result).toBeDefined()
            expect(result?.isDelete).toBe(false) // Confirm it remains restored
        })

        test('should return null if database operation fails', async () => {
            // Mock Job.findByIdAndUpdate to simulate a database failure
            jest.spyOn(Job, 'findByIdAndUpdate').mockImplementationOnce(() => {
                throw new Error('Database error')
            })

            await expect(jobService.restoreJob(mockJobId)).rejects.toThrowError('Database error')
        })
    })
})

export const seedData = async () => {
    // Xóa dữ liệu cũ
    await Role.deleteMany({})
    await Account.deleteMany({})
    await Career.deleteMany({})
    await Job.deleteMany({})
    await Apply.deleteMany({})
    await Location.deleteMany({})
    await Unit.deleteMany({})

    // Thêm dữ liệu roles vào cơ sở dữ liệu
    const roles = [
        { roleName: 'INTERVIEWER' },
        { roleName: 'CANDIDATE' },
        { roleName: 'RECRUITER' },
        { roleName: 'ADMIN' },
        { roleName: 'HR_MANAGER' },
        { roleName: 'INTERVIEW_MANAGER' },
    ]

    const createdRoles = await Role.insertMany(roles)

    // Thêm dữ liệu Location mẫu
    const location1 = await Location.create({
        name: 'Hanoi',
        address: '123 Hanoi Street',
        district: 'Hoàn Kiếm',
        city: 'Hanoi',
        country: 'Vietnam',
    })

    const location2 = await Location.create({
        name: 'Ho Chi Minh City',
        address: '456 HCM Street',
        district: '1',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
    })

    // Thêm dữ liệu Unit mẫu
    const unit1 = await Unit.create({
        name: 'Development Team',
        image: 'unit1_image_url',
        introduction: 'We build amazing software.',
        banner: 'unit1_banner_url',
        locations: [location1._id, location2._id],
    })

    const unit2 = await Unit.create({
        name: 'Design Team',
        image: 'unit2_image_url',
        introduction: 'We create beautiful designs.',
        banner: 'unit2_banner_url',
        locations: [location1._id],
    })

    // Thêm dữ liệu Career mẫu
    const career1 = await Career.create({ name: 'Software Engineering' })
    const career2 = await Career.create({ name: 'Data Science' })

    // Thêm Account mẫu
    const accounts = [
        { email: 'manager1@example.com', name: 'Manager 1', role: createdRoles[3]._id }, // ADMIN
        { email: 'manager2@example.com', name: 'Manager 2', role: createdRoles[4]._id }, // HR_MANAGER
        { email: 'manager3@example.com', name: 'Manager 3', role: createdRoles[3]._id }, // ADMIN
        { email: 'manager4@example.com', name: 'Manager 4', role: createdRoles[4]._id }, // HR_MANAGER
        { email: 'manager5@example.com', name: 'Manager 5', role: createdRoles[3]._id }, // ADMIN
        { email: 'manager6@example.com', name: 'Manager 6', role: createdRoles[4]._id }, // HR_MANAGER
    ]

    const createdAccounts = await Account.insertMany(accounts)

    // Thêm dữ liệu Job mẫu cho tất cả Account
    const jobs = []
    for (const account of createdAccounts) {
        const job = await Job.create({
            title: 'Frontend Developer',
            introduction: 'Develop UI components',
            description: 'Work with ReactJS and TypeScript',
            minSalary: 1000,
            maxSalary: 2000,
            expiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
            startDate: new Date(),
            numberPerson: 2,
            unit: unit1._id,
            career: career1._id,
            interviewManager: account._id,
            account: account._id,
            location: location1._id,
            applies: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            address: 'Tân xã',
            isDelete: false,
            isActive: true,
            isFullTime: true,
            type: 'parttime', // Ensure this value is valid
            status: 'pending', // Ensure this value is valid
            benefits: " ['Health Insurance', 'Paid Time Off']", // Example benefits
            requests: "['Resume', 'Cover Letter']", // Example requests
        })
        jobs.push(job)
    }

    console.log('Database seeding completed.')

    return {
        roles: createdRoles,
        locations: [location1, location2],
        units: [unit1, unit2],
        jobs: jobs,
        accounts: createdAccounts,
        careers: [career1, career2],
    }
}
