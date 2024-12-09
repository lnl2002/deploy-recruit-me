/* eslint-disable @typescript-eslint/no-require-imports */
import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import applicantReportService from '../../services/applicantReportService'
import ApplicantReport from '../../models/applicantReportModel'
import Role from '../../models/roleModel'
import Account from '../../models/accountModel'

describe('applicantReportService', () => {
    let mongoServer: MongoMemoryServer
    let accountId: mongoose.Types.ObjectId
    let roleId: mongoose.Types.ObjectId

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

        // Tạo Role và Account để sử dụng trong test
        roleId = (await Role.create({ roleName: 'Interviewer' }))._id
        const account = await Account.create({
            name: 'John Doe',
            email: 'john@example.com',
            role: roleId,
        })
        accountId = account._id
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await ApplicantReport.deleteMany({})
    })

    describe('getApplicantReport', () => {
        it('should return applicant report based on query', async () => {

            const report = await ApplicantReport.create({
                details: [
                    { criteriaName: 'Skill', comment: 'Good' },
                    { criteriaName: 'Experience', comment: 'Relevant' },
                ],
                createdBy: accountId,
                score: 85,
                isPass: true,
            })

            const result = await applicantReportService.getApplicantReport({ _id: report._id })

            expect(result).not.toBeNull()
            expect(result._id.toString()).toBe(report._id.toString())
            expect(result.details).toHaveLength(2)
            expect(result.createdBy.name.toString()).toBe('John Doe')
        })

        it('should return null if no report is found', async () => {
            const result = await applicantReportService.getApplicantReport({ _id: new Types.ObjectId() })
            expect(result).toBeNull()
        })
    })

    describe('updateApplicantReport', () => {
        it('should update the applicant report', async () => {
            const report = await ApplicantReport.create({
                details: [
                    { criteriaName: 'Skill', comment: 'Good' },
                    { criteriaName: 'Experience', comment: 'Relevant' },
                ],
                createdBy: accountId,
                score: 85,
                isPass: true,
            })

            const updatedData = {
                score: 90,
                details: [{ criteriaName: 'Skill', comment: 'Excellent' }],
            }

            const updatedReport = await applicantReportService.updateApplicantReport(report._id, updatedData)

            expect(updatedReport).not.toBeNull()
            expect(updatedReport.score).toBe(90)
            expect(updatedReport.details[0].comment).toBe('Excellent')
        })

        it('should return null if report does not exist', async () => {
            const result = await applicantReportService.updateApplicantReport(new Types.ObjectId(), { score: 90 })
            expect(result).toBeNull()
        })
    })

    describe('addApplicantReport', () => {
        it('should create and return a new applicant report', async () => {
            const reportData = {
                details: [
                    { criteriaName: 'Skill', comment: 'Good' },
                    { criteriaName: 'Experience', comment: 'Relevant' },
                ],
                createdBy: accountId,
                score: 85,
                isPass: true,
            }

            const newReport = await applicantReportService.addApplicantReport(reportData)
            console.log("newReport",  JSON.stringify(newReport));


            expect(newReport).not.toBeNull()
            expect(newReport.score).toBe(85)
            expect(newReport.details).toHaveLength(2)
            expect(newReport.createdBy.name.toString()).toBe('John Doe')
        })

        it('should throw error if missing required fields', async () => {
            const incompleteReportData = {
                details: [{ criteriaName: 'Skill', comment: 'Good' }],
                score: 85
            }

            await expect(applicantReportService.addApplicantReport(incompleteReportData)).rejects.toThrow()
        })
    })
})
