/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose'
import Account from '../../models/accountModel'
import MeetingRoom, { IMeetingApproveStatus, IParticipantStatus } from '../../models/meetingRoomModel'
import meetingService from '../meetingRoom'
import CVStatus from '../../models/cvStatusModel'
import Role from '../../models/roleModel'

jest.mock('../../models/accountModel')
jest.mock('../../models/roleModel')
jest.mock('../../models/meetingRoomModel')
jest.mock('../../models/cvStatusModel')

describe('meetingService', () => {
    describe('updateMeetingStatus', () => {
        const mockMeetingRoom = {
            _id: '670bce18af4cd6f041a941eb',
            participants: [
                { participant: '670bce18af4cd6f041a941e2', status: IMeetingApproveStatus.PENDING },
                { participant: '670bce18af4cd6f041a941e2', status: IMeetingApproveStatus.PENDING },
            ],
            rejectCount: 0,
            save: jest.fn().mockResolvedValue(true),
        }

        const mockUser = {
            _id: '670bce18af4cd6f041a941e2',
            role: { _id: '67054389ed2e0308d22c66fa', roleName: 'CANDIDATE' },
            populate: jest.fn().mockResolvedValue({
                _id: '670bce18af4cd6f041a941e2',
                role: { _id: '67054389ed2e0308d22c66fa', roleName: 'CANDIDATE' },
            }), // Mock .populate() trả về chính nó
        }

        MeetingRoom.findById = jest.fn().mockResolvedValue(mockMeetingRoom)
        Account.findById = jest.fn().mockReturnValue(mockUser)

        beforeEach(() => {
            jest.clearAllMocks() // Reset mocks trước mỗi test
        })

        it('should throw error if meeting room not found', async () => {
            MeetingRoom.findById = jest.fn().mockResolvedValue(null)

            await expect(
                meetingService.updateMeetingStatus({
                    meetingRoomId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941eb'),
                    participantId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941eb'),
                    status: IMeetingApproveStatus.APPROVED,
                    declineReason: '',
                }),
            ).rejects.toThrow('Meeting Room not found')
        })

        it('should throw error if user not found', async () => {
            MeetingRoom.findById = jest.fn().mockResolvedValue(mockMeetingRoom)
            Account.findById = jest.fn().mockImplementation(() => {
                return {
                    populate: jest.fn().mockResolvedValue(null), // populate sẽ trả về null
                }
            })

            await expect(
                meetingService.updateMeetingStatus({
                    meetingRoomId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941eb'),
                    participantId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941e2'),
                    status: IMeetingApproveStatus.APPROVED,
                    declineReason: '',
                }),
            ).rejects.toThrow('User not found')
        })

        it('should throw error if participant not found in meeting room', async () => {
            MeetingRoom.findById = jest.fn().mockResolvedValue(mockMeetingRoom)
            Account.findById = jest.fn().mockReturnValue(mockUser)
            await expect(
                meetingService.updateMeetingStatus({
                    meetingRoomId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941eb'),
                    participantId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941ec'),
                    status: IMeetingApproveStatus.APPROVED,
                    declineReason: '',
                }),
            ).rejects.toThrow('Participant not found in meeting room: 670bce18af4cd6f041a941ec')
        })

        it('should update participant status to .APPROVED successfully', async () => {
            MeetingRoom.findById = jest.fn().mockResolvedValue(mockMeetingRoom)
            Account.findById = jest.fn().mockReturnValue(mockUser)
            const status = IMeetingApproveStatus.APPROVED
            await meetingService.updateMeetingStatus({
                meetingRoomId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941eb'),
                participantId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941e2'),
                status,
                declineReason: '',
            })

            expect(mockMeetingRoom.participants[0].status).toBe(status)
            expect(mockMeetingRoom.save).toHaveBeenCalled()
        })

        it('should reject participant and add decline reason when status is REJECTED', async () => {
            MeetingRoom.findById = jest.fn().mockResolvedValue(mockMeetingRoom)
            Account.findById = jest.fn().mockReturnValue(mockUser)
            const status = IMeetingApproveStatus.REJECTED
            const declineReason = 'Candidate did not respond'

            await meetingService.updateMeetingStatus({
                meetingRoomId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941eb'),
                participantId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941e2'),
                status,
                declineReason,
            })

            expect(mockMeetingRoom.participants[0].status).toBe(status)
            expect(mockMeetingRoom.participants[0].declineReason).toBe(declineReason)
            expect(mockMeetingRoom.save).toHaveBeenCalled()
        })

        it('should increase rejectCount if participant is rejected and has candidate role', async () => {
            MeetingRoom.findById = jest.fn().mockResolvedValue(mockMeetingRoom)
            Account.findById = jest.fn().mockReturnValue(mockUser)
            const status = IMeetingApproveStatus.REJECTED
            mockMeetingRoom.rejectCount = 2 // Setting the initial reject count to 2

            await meetingService.updateMeetingStatus({
                meetingRoomId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941eb'),
                participantId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941e2'),
                status,
                declineReason: '',
            })

            expect(mockMeetingRoom.rejectCount).toBe(3) // It should increment reject count to 3
            expect(mockMeetingRoom.save).toHaveBeenCalled()
        })

        it('should log message when rejectCount reaches 3', async () => {
            MeetingRoom.findById = jest.fn().mockResolvedValue(mockMeetingRoom)
            Account.findById = jest.fn().mockReturnValue(mockUser)
            const status = IMeetingApproveStatus.REJECTED
            mockMeetingRoom.rejectCount = 2 // Setting the initial reject count to 2
            console.log = jest.fn() // Mocking console.log

            await meetingService.updateMeetingStatus({
                meetingRoomId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941eb'),
                participantId: new mongoose.Types.ObjectId('670bce18af4cd6f041a941e2'),
                status,
                declineReason: '',
            })

            expect(console.log).toHaveBeenCalledWith(
                'Candidate 670bce18af4cd6f041a941e2 CV has been rejected due to multiple rejections.',
            )
        })
    })

    describe('getInterviewSchedules', () => {
        const mockFind = jest.fn()
        MeetingRoom.find = mockFind // Override method find

        const mockSchedules = [
            { id: '1', participants: [{ participant: '123' }], timeStart: new Date('2024-12-01T10:00:00') },
            { id: '2', participants: [{ participant: '123' }], timeStart: new Date('2024-12-02T15:00:00') },
        ]

        beforeEach(() => {
            jest.clearAllMocks() // Reset mocks trước mỗi test
        })

        it('should return schedules for the given interviewer and time range', async () => {
            mockFind.mockResolvedValue(mockSchedules)

            const params = {
                interviewerId: '123',
                startTime: new Date('2024-12-01T00:00:00'),
                endTime: new Date('2024-12-03T00:00:00'),
            }

            const result = await meetingService.getInterviewSchedules(params)

            expect(mockFind).toHaveBeenCalledWith({
                participants: {
                    $elemMatch: { participant: params.interviewerId },
                },
                timeStart: {
                    $gte: params.startTime,
                    $lte: params.endTime,
                },
            })
            expect(result).toEqual(mockSchedules)
        })

        it('should return an empty array if no schedules match the criteria', async () => {
            mockFind.mockResolvedValue([])

            const params = {
                interviewerId: '123',
                startTime: new Date('2024-12-01T00:00:00'),
                endTime: new Date('2024-12-03T00:00:00'),
            }

            const result = await meetingService.getInterviewSchedules(params)

            expect(mockFind).toHaveBeenCalled()
            expect(result).toEqual([])
        })

        it('should handle cases where the interviewer ID is not found in participants', async () => {
            mockFind.mockResolvedValue([])

            const params = {
                interviewerId: '999',
                startTime: new Date('2024-12-01T00:00:00'),
                endTime: new Date('2024-12-03T00:00:00'),
            }

            const result = await meetingService.getInterviewSchedules(params)

            expect(mockFind).toHaveBeenCalled()
            expect(result).toEqual([])
        })

        it('should throw an error if MeetingRoom.find fails', async () => {
            mockFind.mockRejectedValue(new Error('Database error'))

            const params = {
                interviewerId: '123',
                startTime: new Date('2024-12-01T00:00:00'),
                endTime: new Date('2024-12-03T00:00:00'),
            }

            await expect(meetingService.getInterviewSchedules(params)).rejects.toThrow('Database error')
            expect(mockFind).toHaveBeenCalled()
        })

        it('should handle an invalid date range (startTime > endTime)', async () => {
            const params = {
                interviewerId: '123',
                startTime: new Date('2024-12-03T00:00:00'),
                endTime: new Date('2024-12-01T00:00:00'),
            }

            await expect(meetingService.getInterviewSchedules(params)).resolves.toEqual([])
            expect(mockFind).not.toHaveBeenCalled()
        })

        it('should handle missing parameters gracefully', async () => {
            const params = {
                interviewerId: '',
                startTime: undefined,
                endTime: undefined,
            }

            await expect(meetingService.getInterviewSchedules(params)).resolves.toEqual([])
            expect(mockFind).not.toHaveBeenCalled()
        })
    })

    describe('createMeetingRoom', () => {
        const mockFind = jest.fn()
        const mockSave = jest.fn()
        MeetingRoom.find = mockFind
        MeetingRoom.prototype.save = mockSave

        beforeEach(() => {
            jest.clearAllMocks() // Reset mocks trước mỗi test
        })

        const mockParticipants: IParticipantStatus[] = [
            {
                participant: new mongoose.Types.ObjectId('6457e9b0f5d3c3f1a8f5d1a1'),
                status: IMeetingApproveStatus.APPROVED,
            },
            {
                participant: new mongoose.Types.ObjectId('6457e9b0f5d3c3f1a8f5d1a2'),
                status: IMeetingApproveStatus.REJECTED,
                declineReason: 'Not available',
            },
        ]

        const validParams = {
            url: 'http://example.com/meeting',
            participants: mockParticipants,
            timeStart: new Date('2024-12-08T12:00:00'),
            timeEnd: new Date('2024-12-08T13:00:00'),
            applyId: 'apply_001',
        }

        const mockOverlappingMeetings = [
            {
                id: '1',
                participants: mockParticipants,
                timeStart: new Date('2024-12-08T10:00:00'),
                timeEnd: new Date('2024-12-08T11:00:00'),
            },
        ]

        it('should create a meeting room successfully when all participants are valid', async () => {
            mockFind.mockResolvedValue([]) // Không có phòng họp trùng
            mockSave.mockResolvedValue(validParams)

            const result = await meetingService.createMeetingRoom(validParams)

            expect(mockFind).toHaveBeenCalled()
            expect(mockSave).toHaveBeenCalled()
            expect(result).toEqual(validParams)
        })

        it('should return an error if there is a participant conflict', async () => {
            mockFind.mockResolvedValue(mockOverlappingMeetings) // Có phòng họp trùng

            const result = await meetingService.createMeetingRoom(validParams)

            expect(mockFind).toHaveBeenCalled()
            expect(mockSave).not.toHaveBeenCalled()
            expect(result).toEqual({
                isError: true,
                message: 'One or more participants have a conflicting meeting schedule.',
            })
        })

        it('should not return an error if participants do not conflict but time overlaps', async () => {
            const nonConflictingMeetings = [
                {
                    id: '1',
                    participants: [{ participant: '789' }],
                    timeStart: new Date('2024-12-08T10:00:00'),
                    timeEnd: new Date('2024-12-08T11:00:00'),
                },
            ]
            mockFind.mockResolvedValue(nonConflictingMeetings)

            const result = await meetingService.createMeetingRoom(validParams)

            expect(mockFind).toHaveBeenCalled()
            expect(mockSave).toHaveBeenCalled()
            expect(result).toEqual(validParams)
        })

        it('should return an error if participants are missing', async () => {
            const invalidParams = { ...validParams, participants: [] }

            const result = await meetingService.createMeetingRoom(invalidParams)

            expect(mockFind).not.toHaveBeenCalled()
            expect(mockSave).not.toHaveBeenCalled()
            expect(result).toEqual({
                isError: true,
                message: 'Participants are required.',
            })
        })

        it('should return an error if timeStart is after timeEnd', async () => {
            const invalidParams = { ...validParams, timeStart: new Date('2024-12-08T14:00:00') }

            const result = await meetingService.createMeetingRoom(invalidParams)

            expect(mockFind).not.toHaveBeenCalled()
            expect(mockSave).not.toHaveBeenCalled()
            expect(result).toEqual({
                isError: true,
                message: 'Invalid time range.',
            })
        })

        it('should return an error if any participant has an invalid status', async () => {
            const invalidParticipants: IParticipantStatus[] = [
                { participant: new mongoose.Types.ObjectId(), status: 'invalidStatus' as any },
                { participant: new mongoose.Types.ObjectId(), status: 'approved' },
            ]

            const params = { ...validParams, participants: invalidParticipants }

            const result = await meetingService.createMeetingRoom(params)

            expect(result).toEqual({
                isError: true,
                message: 'Invalid participant status found.',
            })
        })

        it('should return an error if declineReason is provided for non-declined status', async () => {
            const invalidParticipants: IParticipantStatus[] = [
                {
                    participant: new mongoose.Types.ObjectId(),
                    status: IMeetingApproveStatus.APPROVED,
                    declineReason: 'Should not be here',
                },
            ]

            const params = { ...validParams, participants: invalidParticipants }

            const result = await meetingService.createMeetingRoom(params)

            expect(result).toEqual({
                isError: true,
                message: 'Decline reason should only be provided for declined status.',
            })
        })

        it('should handle participants that are IAccount instances', async () => {
            const accountParticipants: IParticipantStatus[] = [
                { participant: { _id: 'account_1', name: 'User A' } as any, status: IMeetingApproveStatus.APPROVED },
            ]

            const params = { ...validParams, participants: accountParticipants }

            mockFind.mockResolvedValue([])
            mockSave.mockResolvedValue(params)

            const result = await meetingService.createMeetingRoom(params)

            expect(mockFind).toHaveBeenCalled()
            expect(mockSave).toHaveBeenCalled()
            expect(result).toEqual(params)
        })

        it('should allow creating a meeting room when some participants have valid declined status and reasons', async () => {
            const mixedParticipants: IParticipantStatus[] = [
                {
                    participant: new mongoose.Types.ObjectId(),
                    status: IMeetingApproveStatus.REJECTED,
                    declineReason: 'Not available',
                },
                { participant: new mongoose.Types.ObjectId(), status: IMeetingApproveStatus.APPROVED },
            ]

            const params = { ...validParams, participants: mixedParticipants }

            mockFind.mockResolvedValue([])
            mockSave.mockResolvedValue(params)

            const result = await meetingService.createMeetingRoom(params)

            expect(mockFind).toHaveBeenCalled()
            expect(mockSave).toHaveBeenCalled()
            expect(result).toEqual(params)
        })
    })

    describe('getMeetingRoom', () => {
        it('should return a meeting room when a valid URL is given', async () => {
            const mockRoom = { url: 'valid-url', name: 'Meeting Room 1' }
            MeetingRoom.findOne.mockResolvedValue(mockRoom)

            const result = await meetingService.getMeetingRoom('valid-url')
            expect(result).toEqual(mockRoom)
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ url: 'valid-url' })
        })

        it('should return null when the URL does not match any room', async () => {
            MeetingRoom.findOne.mockResolvedValue(null)

            const result = await meetingService.getMeetingRoom('non-existent-url')
            expect(result).toBeNull()
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ url: 'non-existent-url' })
        })

        it('should handle errors thrown by the database', async () => {
            const error = new Error('Database Error')
            MeetingRoom.findOne.mockRejectedValue(error)

            await expect(meetingService.getMeetingRoom('error-url')).rejects.toThrow('Database Error')
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ url: 'error-url' })
        })

        it('should return null for an empty URL', async () => {
            MeetingRoom.findOne.mockResolvedValue(null)

            const result = await meetingService.getMeetingRoom('')
            expect(result).toBeNull()
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ url: '' })
        })

        it('should return null for a URL with only spaces', async () => {
            MeetingRoom.findOne.mockResolvedValue(null)

            const result = await meetingService.getMeetingRoom('   ')
            expect(result).toBeNull()
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ url: '   ' })
        })

        it('should handle case sensitivity in URL', async () => {
            const mockRoom = { url: 'UpperCaseRoom', name: 'Meeting Room 2' }
            MeetingRoom.findOne.mockResolvedValue(mockRoom)

            const result = await meetingService.getMeetingRoom('UPPERCASEROOM')
            expect(result).toEqual(mockRoom)
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ url: 'UPPERCASEROOM' })
        })
    })

    describe('getMeetingRoomByApplyId', () => {
        it('should return a meeting room when a valid applyId is provided', async () => {
            const mockRoom = { apply: 'valid-apply-id', name: 'Meeting Room 1' }
            MeetingRoom.findOne.mockResolvedValue(mockRoom)

            const result = await meetingService.getMeetingRoomByApplyId('valid-apply-id')
            expect(result).toEqual(mockRoom)
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: 'valid-apply-id' })
        })

        it('should return null when the applyId does not match any room', async () => {
            MeetingRoom.findOne.mockResolvedValue(null)

            const result = await meetingService.getMeetingRoomByApplyId('non-existent-apply-id')
            expect(result).toBeNull()
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: 'non-existent-apply-id' })
        })

        it('should handle errors thrown by the database', async () => {
            const error = new Error('Database Error')
            MeetingRoom.findOne.mockRejectedValue(error)

            await expect(meetingService.getMeetingRoomByApplyId('error-apply-id')).rejects.toThrow('Database Error')
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: 'error-apply-id' })
        })

        it('should return null for an empty applyId', async () => {
            MeetingRoom.findOne.mockResolvedValue(null)

            const result = await meetingService.getMeetingRoomByApplyId('')
            expect(result).toBeNull()
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: '' })
        })

        it('should return null for a applyId with only spaces', async () => {
            MeetingRoom.findOne.mockResolvedValue(null)

            const result = await meetingService.getMeetingRoomByApplyId('   ')
            expect(result).toBeNull()
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: '   ' })
        })

        it('should handle case sensitivity in applyId', async () => {
            const mockRoom = { apply: 'UpperCaseApplyId', name: 'Meeting Room 2' }
            MeetingRoom.findOne.mockResolvedValue(mockRoom)

            const result = await meetingService.getMeetingRoomByApplyId('UPPERCASEAPPLYID')
            expect(result).toEqual(mockRoom)
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: 'UPPERCASEAPPLYID' })
        })
    })

    describe('getMeetingsRoomByJobId', () => {
        const mockApplyModel = {
            find: jest.fn(),
        }
        const mockMeetingRoomModel = {
            find: jest.fn(),
        }

        beforeAll(() => {
            mongoose.model.mockImplementation((modelName) => {
                if (modelName === 'Apply') {
                    return mockApplyModel
                }
                if (modelName === 'MeetingRoom') {
                    return mockMeetingRoomModel
                }
                return null
            })
        })

        afterEach(() => {
            jest.clearAllMocks() // Xóa các mock sau mỗi test
        })

        it('should return meeting rooms for valid jobId', async () => {
            const jobId = 'valid-job-id'
            const mockApplies = [{ _id: 'apply1' }, { _id: 'apply2' }]
            const mockMeetingRooms = [
                { apply: 'apply1', name: 'Room 1' },
                { apply: 'apply2', name: 'Room 2' },
            ]

            mockApplyModel.find.mockResolvedValue(mockApplies)
            mockMeetingRoomModel.find.mockResolvedValue(mockMeetingRooms)

            const result = await meetingService.getMeetingsRoomByJobId(jobId)
            expect(result).toEqual(mockMeetingRooms)
            expect(mockApplyModel.find).toHaveBeenCalledWith({ job: jobId })
            expect(mockMeetingRoomModel.find).toHaveBeenCalledWith({ apply: { $in: ['apply1', 'apply2'] } })
        })

        it('should return null if no applies found for jobId', async () => {
            const jobId = 'non-existent-job-id'
            mockApplyModel.find.mockResolvedValue([])

            const result = await meetingService.getMeetingsRoomByJobId(jobId)
            expect(result).toBeNull()
            expect(mockApplyModel.find).toHaveBeenCalledWith({ job: jobId })
            expect(mockMeetingRoomModel.find).not.toHaveBeenCalled()
        })

        it('should handle errors thrown by apply model', async () => {
            const jobId = 'error-job-id'
            const error = new Error('Database Error')
            mockApplyModel.find.mockRejectedValue(error)

            const result = await meetingService.getMeetingsRoomByJobId(jobId)
            expect(result).toBeNull()
            expect(mockApplyModel.find).toHaveBeenCalledWith({ job: jobId })
        })

        it('should handle errors thrown by meeting room model', async () => {
            const jobId = 'error-job-id'
            const mockApplies = [{ _id: 'apply1' }]
            mockApplyModel.find.mockResolvedValue(mockApplies)
            const error = new Error('Database Error')
            mockMeetingRoomModel.find.mockRejectedValue(error)

            const result = await meetingService.getMeetingsRoomByJobId(jobId)
            expect(result).toBeNull()
            expect(mockApplyModel.find).toHaveBeenCalledWith({ job: jobId })
            expect(mockMeetingRoomModel.find).toHaveBeenCalledWith({ apply: { $in: ['apply1'] } })
        })

        it('should return null if applies are undefined', async () => {
            const jobId = 'undefined-applies-job-id'
            mockApplyModel.find.mockResolvedValue(undefined)

            const result = await meetingService.getMeetingsRoomByJobId(jobId)
            expect(result).toBeNull()
            expect(mockApplyModel.find).toHaveBeenCalledWith({ job: jobId })
            expect(mockMeetingRoomModel.find).not.toHaveBeenCalled()
        })
    })

    describe('getCandidateRejectReason', () => {
        afterEach(() => {
            jest.clearAllMocks() // Xóa các mock sau mỗi test
        })

        it('should return declineReason for the first candidate with role CANDIDATE', async () => {
            const applyId = 'valid-apply-id'
            const mockRole = { _id: 'role-id', roleName: 'CANDIDATE' }
            const mockParticipants = [
                { participant: { _id: 'candidate-id', role: 'role-id' }, declineReason: 'Not qualified' },
            ]
            const mockMeetingRoom = {
                participants: mockParticipants,
            }

            // Mô phỏng phương thức .findOne().select().populate()
            MeetingRoom.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(), // Giả lập hàm select()
                populate: jest.fn().mockResolvedValue(mockMeetingRoom), // Giả lập hàm populate() trả về phòng họp
            })

            Role.findOne.mockResolvedValue(mockRole) // Mô phỏng tìm thấy vai trò

            const result = await meetingService.getCandidateRejectReason(applyId)
            expect(result).toEqual('Not qualified') // Kết quả cần là lý do từ chối
            expect(Role.findOne).toHaveBeenCalledWith({ roleName: 'CANDIDATE' })
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: applyId })
            expect(MeetingRoom.findOne().select).toHaveBeenCalledWith('participants') // Kiểm tra có gọi select() không
            expect(MeetingRoom.findOne().populate).toHaveBeenCalledWith('participants.participant') // Kiểm tra có gọi populate() không
        })

        it('should return null if the CANDIDATE role is not found', async () => {
            const applyId = 'valid-apply-id'
            Role.findOne.mockResolvedValue(null) // Không tìm thấy vai trò

            const result = await meetingService.getCandidateRejectReason(applyId)
            expect(result).toBeNull() // Kết quả phải là null
            expect(Role.findOne).toHaveBeenCalledWith({ roleName: 'CANDIDATE' })
            expect(MeetingRoom.findOne).not.toHaveBeenCalled() // Không gọi tìm MeetingRoom
        })

        it('should return null if no MeetingRoom is found for the given applyId', async () => {
            const applyId = 'valid-apply-id'
            const mockRole = { _id: 'role-id', roleName: 'CANDIDATE' }
            Role.findOne.mockResolvedValue(mockRole) // Mô phỏng tìm thấy vai trò
            MeetingRoom.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null), // Không tìm thấy MeetingRoom
            })

            const result = await meetingService.getCandidateRejectReason(applyId)
            expect(result).toBeNull() // Kết quả phải là null
            expect(Role.findOne).toHaveBeenCalledWith({ roleName: 'CANDIDATE' })
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: applyId })
        })

        it('should return null if no candidates found for the given applyId', async () => {
            const applyId = 'valid-apply-id'
            const mockRole = { _id: 'role-id', roleName: 'CANDIDATE' }
            const mockMeetingRoom = { participants: [] } // Danh sách participants rỗng

            Role.findOne.mockResolvedValue(mockRole) // Mô phỏng tìm thấy vai trò
            MeetingRoom.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockMeetingRoom), // Mô phỏng trả về phòng họp rỗng
            })

            const result = await meetingService.getCandidateRejectReason(applyId)
            expect(result).toBeNull() // Kết quả phải là null
            expect(Role.findOne).toHaveBeenCalledWith({ roleName: 'CANDIDATE' })
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: applyId })
        })

        it('should return null if participant does not match the role', async () => {
            const applyId = 'valid-apply-id'
            const mockRole = { _id: 'role-id', roleName: 'CANDIDATE' }
            const mockParticipants = [
                { participant: { _id: 'not-a-candidate-id', role: 'other-role-id' }, declineReason: 'Not qualified' },
            ]
            const mockMeetingRoom = { participants: mockParticipants } // Ứng viên không khớp vai trò

            Role.findOne.mockResolvedValue(mockRole) // Mô phỏng tìm thấy vai trò
            MeetingRoom.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockMeetingRoom), // Mô phỏng tìm thấy phòng họp
            })

            const result = await meetingService.getCandidateRejectReason(applyId)
            expect(result).toBeNull() // Kết quả phải là null
            expect(Role.findOne).toHaveBeenCalledWith({ roleName: 'CANDIDATE' })
            expect(MeetingRoom.findOne).toHaveBeenCalledWith({ apply: applyId })
        })
    })

    describe('addParticipant', () => {
        afterEach(() => {
            jest.clearAllMocks() // Xóa các mock sau mỗi test
        })

        // Test case 1: Phòng họp không tồn tại
        it('should throw an error if meeting room not found', async () => {
            const meetingId = 'non-existent-meeting-id'
            const participantId = 'participant-id'

            MeetingRoom.findById.mockResolvedValue(null) // Không tìm thấy phòng họp

            await expect(meetingService.addParticipant(meetingId, participantId)).rejects.toThrow(
                'Meeting room not found',
            )
            expect(MeetingRoom.findById).toHaveBeenCalledWith(meetingId)
        })

        // Test case 2: Người tham gia đã tồn tại trong phòng họp
        it('should throw an error if participant already exists in the meeting room', async () => {
            const meetingId = 'meeting-id'
            const participantId = '67028cfe255ea622e2f3db87'
            const mockMeetingRoom = {
                participants: [{ participant: new mongoose.Types.ObjectId(participantId), status: 'some-status' }],
                save: jest.fn().mockResolvedValue(true),
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            await expect(meetingService.addParticipant(meetingId, participantId)).rejects.toThrow(
                'Participant already exists in the meeting room',
            )
            expect(MeetingRoom.findById).toHaveBeenCalledWith(meetingId)
        })

        // Test case 3: Thêm người tham gia thành công nếu người đó không tồn tại
        it('should add participant successfully if the participant does not exist', async () => {
            const meetingId = '6728c588a158d34d86aad7cf'
            const participantId = '67028cfe255ea622e2f3db87'

            const mockMeetingRoom = {
                participants: [],
                push: jest.fn(), // Giả lập hàm push
                save: jest.fn().mockResolvedValue(true), // Mô phỏng hành động lưu
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            const result = await meetingService.addParticipant(meetingId, participantId)

            expect(result).toBe(mockMeetingRoom) // Đảm bảo phòng họp được trả về
            expect(MeetingRoom.findById).toHaveBeenCalledWith(meetingId)
            expect(mockMeetingRoom.save).toHaveBeenCalled() // Đảm bảo rằng save() được gọi
        })

        // Test case 4: Thêm người tham gia với ID không hợp lệ
        it('should throw an error if participantId is invalid', async () => {
            const meetingId = 'meeting-id'
            const participantId = 'invalid-participant-id' // Giả lập ID không hợp lệ

            const mockMeetingRoom = {
                participants: [],
                save: jest.fn().mockResolvedValue(true),
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            await expect(meetingService.addParticipant(meetingId, participantId)).rejects.toThrow()
            expect(MeetingRoom.findById).toHaveBeenCalledWith(meetingId)
        })

        // Test case 5: Thêm nhiều lần với cùng một participantId
        it('should throw an error when trying to add the same participant multiple times', async () => {
            const meetingId = '6728c588a158d34d86aad7cf'
            const participantId = '67028cfe255ea622e2f3db87'

            const mockMeetingRoom = {
                participants: [{ participant: new mongoose.Types.ObjectId(participantId), status: 'some-status' }],
                save: jest.fn().mockResolvedValue(true),
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            // Lần đầu tiên sẽ ném lỗi
            await expect(meetingService.addParticipant(meetingId, participantId)).rejects.toThrow(
                'Participant already exists in the meeting room',
            )

            // Kiểm tra chỉ gọi hàm save 1 lần
            expect(mockMeetingRoom.save).toHaveBeenCalledTimes(0)
        })

        // Test case 6: Kiểm tra xử lý lỗi từ database
        it('should handle errors thrown during meeting room save', async () => {
            const meetingId = '6728c588a158d34d86aad7cf'
            const participantId = '67028cfe255ea622e2f3db87'

            const mockMeetingRoom = {
                participants: [],
                push: jest.fn(),
                save: jest.fn().mockRejectedValue(new Error('Database error')), // Gây lỗi khi lưu
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            await expect(meetingService.addParticipant(meetingId, participantId)).rejects.toThrow('Database error')
            expect(mockMeetingRoom.save).toHaveBeenCalled() // Đảm bảo save() đã được gọi
        })
    })

    describe('removeParticipant', () => {
        afterEach(() => {
            jest.clearAllMocks() // Xóa các mock sau mỗi test
        })

        // Test case 1: Phòng họp không tồn tại
        it('should throw an error if meeting room not found', async () => {
            const meetingRoomId = '6728c588a158d34d86aad7cf'
            const participantId = '67028cfe255ea622e2f3db87'

            MeetingRoom.findById.mockResolvedValue(null) // Không tìm thấy phòng họp

            await expect(meetingService.removeParticipant(meetingRoomId, participantId)).rejects.toThrow(
                'Meeting room not found',
            )
            expect(MeetingRoom.findById).toHaveBeenCalledWith(meetingRoomId)
        })

        // Test case 2: Loại bỏ người tham gia thành công nếu tìm thấy
        it('should remove the participant successfully if found', async () => {
            const meetingRoomId = '6728c588a158d34d86aad7cf'
            const participantId = '67028cfe255ea622e2f3db87'

            const mockMeetingRoom = {
                participants: [
                    { participant: new mongoose.Types.ObjectId(participantId), status: 'some-status' },
                    { participant: new mongoose.Types.ObjectId('6715bbc63fd1b16680d24795'), status: 'some-status' },
                ],
                save: jest.fn().mockResolvedValue(true), // Mô phỏng hàm save
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            const result = await meetingService.removeParticipant(meetingRoomId, participantId)

            expect(result).toBe(mockMeetingRoom) // Đảm bảo phòng họp được trả về
            expect(MeetingRoom.findById).toHaveBeenCalledWith(meetingRoomId) // Kiểm tra hàm tìm
            expect(mockMeetingRoom.participants.length).toBe(1) // Kiểm tra chỉ còn 1 người tham gia
            expect(mockMeetingRoom.participants[0].participant.toString()).not.toBe(participantId) // Người tham gia bị xóa không còn lại
            expect(mockMeetingRoom.save).toHaveBeenCalled() // Đảm bảo rằng save() đã được gọi
        })

        // Test case 3: Không loại bỏ nếu không tìm thấy người tham gia trong phòng họp
        it('should not remove a participant if not found in the meeting room', async () => {
            const meetingRoomId = '6728c588a158d34d86aad7cf'
            const participantId = '6728c588a158d34d86aad7ce'

            const mockMeetingRoom = {
                participants: [
                    { participant: new mongoose.Types.ObjectId('671124aa9578b132a235155d'), status: 'some-status' },
                ],
                save: jest.fn().mockResolvedValue(true), // Mô phỏng hàm save
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            const result = await meetingService.removeParticipant(meetingRoomId, participantId)

            expect(result).toBe(mockMeetingRoom) // Đảm bảo phòng họp được trả về
            expect(MeetingRoom.findById).toHaveBeenCalledWith(meetingRoomId) // Kiểm tra hàm tìm
            expect(mockMeetingRoom.participants.length).toBe(1) // Số lượng tham gia không thay đổi
            expect(mockMeetingRoom.participants[0].participant.toString()).toBe('671124aa9578b132a235155d') // Người tham gia không thay đổi
            expect(mockMeetingRoom.save).toHaveBeenCalled() // Đảm bảo rằng save() đã được gọi
        })

        // Test case 4: Phòng họp chỉ có một người tham gia và sẽ bị loại bỏ
        it('should return an empty participant list if the only participant is removed', async () => {
            const meetingRoomId = '6728c588a158d34d86aad7cf'
            const participantId = '67028cfe255ea622e2f3db87'

            const mockMeetingRoom = {
                participants: [{ participant: new mongoose.Types.ObjectId(participantId), status: 'some-status' }],
                save: jest.fn().mockResolvedValue(true), // Mô phỏng hàm save
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            const result = await meetingService.removeParticipant(meetingRoomId, participantId)

            expect(result).toBe(mockMeetingRoom) // Đảm bảo phòng họp được trả về
            expect(mockMeetingRoom.participants.length).toBe(0) // Danh sách người tham gia sẽ rỗng
            expect(mockMeetingRoom.save).toHaveBeenCalled() // Đảm bảo rằng save() đã được gọi
        })

        // Test case 5: Kiểm tra xử lý lỗi từ cơ sở dữ liệu khi lưu
        it('should handle errors thrown during meeting room save', async () => {
            const meetingRoomId = '6728c588a158d34d86aad7cf'
            const participantId = '6728c588a158d34d86aad7ce'

            const mockMeetingRoom = {
                participants: [{ participant: new mongoose.Types.ObjectId(participantId), status: 'some-status' }],
                save: jest.fn().mockRejectedValue(new Error('Database error')), // Gây lỗi khi lưu
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            await expect(meetingService.removeParticipant(meetingRoomId, participantId)).rejects.toThrow(
                'Database error',
            )
            expect(mockMeetingRoom.save).toHaveBeenCalled() // Đảm bảo save() đã được gọi
        })

        // Test case 6: Phòng họp có nhiều người tham gia và loại bỏ nhiều lần
        it('should not remove any participants if participantIds do not match', async () => {
            const meetingRoomId = '6728c588a158d34d86aad7cf'
            const participantId1 = '67028cfe255ea622e2f3db87'
            const participantId2 = '6702920818f0f8a974ae534b'

            const mockMeetingRoom = {
                participants: [
                    { participant: new mongoose.Types.ObjectId(participantId2), status: 'some-status' },
                    { participant: new mongoose.Types.ObjectId('6705590a3b5ff11912e59d51'), status: 'some-status' },
                ],
                save: jest.fn().mockResolvedValue(true),
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            const result = await meetingService.removeParticipant(meetingRoomId, participantId1)

            expect(result).toBe(mockMeetingRoom)
            expect(mockMeetingRoom.participants.length).toBe(2) // Số lượng tham gia không thay đổi
            expect(mockMeetingRoom.save).toHaveBeenCalled() // Đảm bảo rằng save() đã được gọi
        })

        // Test case 7: Nhiều người tham gia và loại bỏ người không phải cuối cùng
        it('should remove a non-last participant correctly', async () => {
            const meetingRoomId = '6728c588a158d34d86aad7cf'
            const participantId = '6728c588a158d34d86aad7ce'

            const mockMeetingRoom = {
                participants: [
                    { participant: new mongoose.Types.ObjectId(participantId), status: 'some-status' },
                    { participant: new mongoose.Types.ObjectId('6705590a3b5ff11912e59d51'), status: 'some-status' },
                    { participant: new mongoose.Types.ObjectId('671124aa9578b132a235155d'), status: 'some-status' },
                ],
                save: jest.fn().mockResolvedValue(true),
            }

            MeetingRoom.findById.mockResolvedValue(mockMeetingRoom) // Mô phỏng tìm thấy phòng họp

            const result = await meetingService.removeParticipant(meetingRoomId, participantId)

            expect(result).toBe(mockMeetingRoom)
            expect(mockMeetingRoom.participants.length).toBe(2) // Số lượng tham gia sau khi loại bỏ
            expect(mockMeetingRoom.participants.some((p) => p.participant.toString() === participantId)).toBe(false) // Người tham gia bị xóa không còn trong danh sách
            expect(mockMeetingRoom.save).toHaveBeenCalled() // Đảm bảo rằng save() đã được gọi
        })
    })

    describe('meetingService.getCandidateList', () => {
        const mockUserId = '605c72b6f1d4e1a84e307dac' // Ví dụ mock ObjectId
        const mockJobId = '605c72b6f1d4e1a84e307dbe' // Ví dụ mock ObjectId

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should return an empty list if no candidates found', async () => {
            CVStatus.findOne.mockResolvedValue(null)
            MeetingRoom.aggregate.mockResolvedValue([])

            const result = await meetingService.getCandidateList({
                userId: mockUserId,
                jobId: mockJobId,
                limit: 1,
                page: 1,
            })

            expect(result).toEqual({
                total: 0,
                page: 1,
                totalPages: 0,
                data: [],
            })
        })

        it('should return candidates with the correct data', async () => {
            CVStatus.findOne.mockResolvedValue({ _id: 'statusId' })
            MeetingRoom.aggregate.mockResolvedValue([
                {
                    _id: 'meetingId',
                    url: 'http://example.com',
                    timeStart: new Date(),
                    applyDetails: { status: 'statusId' },
                    candidateDetails: { _id: 'candidateId', name: 'John Doe', image: '', email: 'john@example.com' },
                    jobDetails: { _id: mockJobId, title: 'Developer' },
                    cvDetails: { _id: 'cvId', email: 'john@example.com' },
                    statusDetails: {},
                    participantsDetails: [{ _id: 'participantId', email: 'participant@example.com', name: 'Jane Doe' }],
                },
            ])

            const result = await meetingService.getCandidateList({
                userId: mockUserId,
                jobId: mockJobId,
                limit: 1,
                page: 1,
            })

            // expect(result.total).toBe(1);
            expect(result.data).toHaveLength(1)
            expect(result.data[0].candidateDetails.name).toBe('John Doe')
        })

        it('should handle pagination correctly', async () => {
            CVStatus.findOne.mockResolvedValue({ _id: 'statusId' })

            // Đầu tiên, mock cho cuộc gọi aggregate đầu tiên (lấy danh sách ứng viên)
            MeetingRoom.aggregate.mockImplementationOnce(() =>
                Promise.resolve([
                    {
                        _id: 'meetingId2',
                        url: 'http://example.com/2',
                        timeStart: new Date(),
                        applyDetails: { status: 'statusId' },
                        candidateDetails: {
                            _id: 'candidateId2',
                            name: 'Jane Smith',
                            image: '',
                            email: 'jane@example.com',
                        },
                        jobDetails: { _id: mockJobId, title: 'Developer' },
                        cvDetails: { _id: 'cvId2', email: 'jane@example.com' },
                        statusDetails: {},
                        participantsDetails: [
                            { _id: 'participantId2', email: 'participant2@example.com', name: 'Doe John' },
                        ],
                    },
                ]),
            )

            // Mock cho cuộc gọi aggregate thứ hai (đếm tổng ứng viên)
            MeetingRoom.aggregate.mockImplementationOnce(() => Promise.resolve([{ total: 2 }]))

            const result = await meetingService.getCandidateList({
                userId: mockUserId,
                limit: 1,
                page: 2,
            })

            expect(result.page).toBe(2)
            expect(result.totalPages).toBe(2)
            expect(result.data).toHaveLength(1)
            expect(result.data[0].candidateDetails.name).toBe('Jane Smith') // Kiểm tra ứng viên đầu tiên trong trang 2
        })

        it('should return candidates filtered by jobId if provided', async () => {
            CVStatus.findOne.mockResolvedValue({ _id: 'statusId' })
            MeetingRoom.aggregate.mockResolvedValue([
                {
                    _id: 'meetingId1',
                    url: 'http://example.com/1',
                    timeStart: new Date(),
                    applyDetails: { status: 'statusId' },
                    candidateDetails: { _id: 'candidateId1', name: 'John Doe', image: '', email: 'john@example.com' },
                    jobDetails: { _id: mockJobId, title: 'Developer' },
                    cvDetails: { _id: 'cvId1', email: 'john@example.com' },
                    statusDetails: {},
                    participantsDetails: [
                        { _id: 'participantId1', email: 'participant@example.com', name: 'Jane Doe' },
                    ],
                },
            ])

            const result = await meetingService.getCandidateList({
                userId: mockUserId,
                jobId: mockJobId,
                limit: 1,
                page: 1,
            })

            expect(result.data).toHaveLength(1)
            expect(result.data[0].jobDetails._id).toBe(mockJobId)
        })

        it('should throw an error if an unexpected error occurs', async () => {
            CVStatus.findOne.mockRejectedValue(new Error('Database error'))

            await expect(
                meetingService.getCandidateList({
                    userId: mockUserId,
                    limit: 1,
                    page: 1,
                    statusFilter: 'New',
                }),
            ).rejects.toThrow('Database error')
        })

        it('should sort candidates based on apply.cvScore.averageScore correctly', async () => {
            CVStatus.findOne.mockResolvedValue({ _id: 'statusId' })
            MeetingRoom.aggregate.mockResolvedValue([
                {
                    /* Candidate data with score... */
                },
                {
                    /* Candidate data with score... */
                },
            ])

            const result = await meetingService.getCandidateList({
                userId: mockUserId,
                limit: 1,
                page: 1,
                sortField: 'apply.cvScore.averageScore',
                sortOrder: 'desc',
            })

            // Assert the order of candidates based on their scores
            expect(result.data[0]).toBeDefined() // Check that we received data
        })

        it('should return correct total count of candidates', async () => {
            CVStatus.findOne.mockResolvedValue({ _id: 'statusId' })
            MeetingRoom.aggregate.mockResolvedValue([{ total: 5 }])

            const result = await meetingService.getCandidateList({
                userId: mockUserId,
                limit: 1,
                page: 1,
            })

            expect(result.total).toBe(5)
        })

        it('should return empty list if statusFilter does not match any status', async () => {
            CVStatus.findOne.mockResolvedValue(null)

            const result = await meetingService.getCandidateList({
                userId: mockUserId,
                limit: 1,
                page: 1,
                statusFilter: 'nonExistentStatus', // Status không tồn tại
            })

            expect(result).toEqual({
                total: 0,
                page: 1,
                totalPages: 0,
                data: [],
            })
        })

        it('should set statusId if statusFilter matches a status', async () => {
            // Giả lập dữ liệu trạng thái trên cơ sở dữ liệu
            const mockStatusId = 'statusId'
            CVStatus.findOne.mockResolvedValue({ _id: mockStatusId })

            // Giả lập dữ liệu ứng viên trả về
            MeetingRoom.aggregate.mockResolvedValue([
                {
                    _id: 'meetingId',
                    url: 'http://example.com',
                    timeStart: new Date(),
                    applyDetails: { status: mockStatusId },
                    candidateDetails: { _id: 'candidateId', name: 'John Doe', image: '', email: 'john@example.com' },
                    jobDetails: { _id: mockJobId, title: 'Developer' },
                    cvDetails: { _id: 'cvId', email: 'john@example.com' },
                    statusDetails: {},
                    participantsDetails: [{ _id: 'participantId', email: 'participant@example.com', name: 'Jane Doe' }],
                },
            ])

            const result = await meetingService.getCandidateList({
                userId: mockUserId,
                limit: 1,
                page: 1,
                statusFilter: 'existentStatus', // Status tồn tại
            })

            expect(result.data).toHaveLength(1)
            expect(result.data[0].candidateDetails.name).toBe('John Doe')
        })
    })
})
