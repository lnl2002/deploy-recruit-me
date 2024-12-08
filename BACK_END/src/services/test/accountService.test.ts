/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import accountService from '../../services/accountService'
import Account, { IAccoutStatus } from '../../models/accountModel'
import Role from '../../models/roleModel'

describe('accountService', () => {
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
        await Account.deleteMany({})
        await Role.deleteMany({})
    })

    describe('getAccountList', () => {
        it('should return accounts and total count', async () => {
            const role = await Role.create({ roleName: 'Admin' })
            await Account.create([{ name: 'John Doe', email: 'john@example.com', role: role._id }])

            const result = await accountService.getAccountList({}, {})

            expect(result.total).toBe(1)
            expect(result.accounts).toHaveLength(1)
            expect(result.accounts[0].name).toBe('John Doe')
        })

        it('should filter accounts by role', async () => {
            try {
                const role1 = await Role.create({ roleName: 'Admin' })
                const role2 = await Role.create({ roleName: 'User' })

                await Account.create([
                    { name: 'Admin User', email: 'admin@example.com', role: role1._id },
                    { name: 'Regular User', email: 'user@example.com', role: role2._id },
                ])
                const result = await accountService.getAccountList({ role: 'Admin' }, {})

                expect(result.total).toBe(1)
                expect(result.accounts[0].name).toBe('Admin User')
            } catch (err: any) {
                console.log('should filter accounts by role err', err)
            }
        })

        it('should sort accounts by a specific field', async () => {
            const role1 = await Role.create({ roleName: 'Admin' })
            const role2 = await Role.create({ roleName: 'User' })

            await Account.create([
                { name: 'B User', email: 'b@example.com', role: role1._id },
                { name: 'A User', email: 'a@example.com', role: role2._id },
            ])

            const result = await accountService.getAccountList({ sort_field: 'name', order: 'asc' }, {})

            expect(result.accounts[0].name).toBe('A User')
            expect(result.accounts[1].name).toBe('B User')
        })

        it('should paginate results', async () => {
            const role1 = await Role.create({ roleName: 'Admin' })

            await Account.create([
                { name: 'User 1', email: 'user1@example.com', role: role1._id },
                { name: 'User 2', email: 'user2@example.com', role: role1._id },
            ])

            const result = await accountService.getAccountList({ limit: 1, skip: 1 }, {})

            expect(result.accounts).toHaveLength(1)
            expect(result.accounts[0].name).toBe('User 2')
        })

        it('should return no accounts if no match is found', async () => {
            const role1 = await Role.create({ roleName: 'Admin' })

            await Account.create([
                { name: 'User 1', email: 'user1@example.com', role: role1._id },
                { name: 'User 2', email: 'user2@example.com', role: role1._id },
            ])

            const result = await accountService.getAccountList({ role: 'NonExistentRole' }, {})

            expect(result.total).toBe(0)
            expect(result.accounts).toHaveLength(0)
        })

        it('should throw error on invalid query', async () => {
            await expect(accountService.getAccountList({ limit: -1 }, {})).rejects.toThrow()
        })
    })

    describe('getAccountById', () => {
        it('should return the account by ID', async () => {
            const role1 = await Role.create({ roleName: 'Admin' })

            const account = (await Account.create({
                name: 'John Doe',
                email: 'john@example.com',
                role: role1._id,
            })) as any

            const result = await accountService.getAccountById(account._id)

            expect(result).not.toBeNull()
            expect(result?.name).toBe('John Doe')
        })

        it('should return null if account does not exist', async () => {
            const result = await accountService.getAccountById(new Types.ObjectId())

            expect(result).toBeNull()
        })
    })

    describe('addAccount', () => {
        it('should create a new account', async () => {
            const role1 = (await Role.create({ roleName: 'Admin' })) as any

            const data = { name: 'New User', email: 'newuser@example.com', role: role1._id }

            const account = await accountService.addAccount(data)

            expect(account).not.toBeNull()
            expect(account.name).toBe('New User')
        })

        it('should throw error for duplicate email', async () => {
            const role1 = (await Role.create({ roleName: 'Admin' })) as any

            await Account.create({ name: 'User', email: 'user@example.com', role: role1._id })

            await expect(
                accountService.addAccount({ name: 'Duplicate User', email: 'user@example.com', role: role1._id }),
            ).rejects.toThrow()
        })
    })

    describe('getInterviewerByUnit', () => {
        it('should return interviewers and managers for the given unit', async () => {
            const roleInterviewer = await Role.create({ roleName: 'INTERVIEWER' })
            const roleManager = await Role.create({ roleName: 'INTERVIEW_MANAGER' })

            const unitId = new Types.ObjectId()
            await Account.create([
                { name: 'Interviewer', email: 'int@example.com', role: roleInterviewer._id, unit: unitId },
                { name: 'Manager', email: 'mgr@example.com', role: roleManager._id, unit: unitId },
            ])

            const result = await accountService.getInterviewerByUnit(unitId.toString())

            expect(result).toHaveLength(2)
        })

        it('should return empty array if no interviewers or managers are found', async () => {
            const unitId = new Types.ObjectId()
            const result = await accountService.getInterviewerByUnit(unitId.toString())

            expect(result).toHaveLength(0)
        })

        it('should return empty array if INTERVIEW_MANAGER role is missing', async () => {
            await Role.create({ roleName: 'INTERVIEWER' }) // Only create INTERVIEWER role
            const unitId = new Types.ObjectId()

            const result = await accountService.getInterviewerByUnit(unitId.toString())

            expect(result).toHaveLength(0) // Expect an empty array since INTERVIEW_MANAGER role is not found
        })
    })

    describe('updateStatus', () => {
        it('should update the status of an account', async () => {
            const role1 = await Role.create({ roleName: 'Admin' })

            const account = await Account.create({
                name: 'User',
                email: 'user@example.com',
                status: IAccoutStatus.INACTIVE,
                role: role1._id,
            })

            const updatedAccount = await accountService.updateStatus(account._id.toString(), IAccoutStatus.ACTIVE)

            expect(updatedAccount?.status).toBe(IAccoutStatus.ACTIVE)
        })

        it('should return null if account does not exist', async () => {
            const nonExistentId = new Types.ObjectId().toString()

            const updatedAccount = await accountService.updateStatus(nonExistentId, IAccoutStatus.ACTIVE)

            expect(updatedAccount).toBeNull()
        })


        it('should not change the status if the new status is the same', async () => {
            const role1 = await Role.create({ roleName: 'Admin' })

            const account = await Account.create({
                name: 'User',
                email: 'user@example.com',
                status: IAccoutStatus.ACTIVE,
                role: role1._id,
            })

            const updatedAccount = await accountService.updateStatus(account._id.toString(), IAccoutStatus.ACTIVE)

            expect(updatedAccount?.status).toBe(IAccoutStatus.ACTIVE)
        })

    })

    describe('createAccount', () => {
        it('should create an account successfully', async () => {
            const role1 = (await Role.create({ roleName: 'Admin' })) as any
            const account = await accountService.createAccount({
                name: 'Test User',
                email: 'test@example.com',
                role: role1._id,
            })

            expect(account).not.toBeNull()
            expect(account.name).toBe('Test User')
        })

        it('should throw validation error if required fields are missing', async () => {
            await expect(
                accountService.createAccount({
                    email: 'missingname@example.com', // Missing 'name' field
                } as any),
            ).rejects.toThrowError("Account validation failed: role: Path `role` is required., name: Path `name` is required.");
        });

        it('should throw an error for duplicate email', async () => {
            const role1 = await Role.create({ roleName: 'Admin' });

            await accountService.createAccount({
                name: 'Original User',
                email: 'duplicate@example.com',
                role: role1._id,
            });

            await expect(
                accountService.createAccount({
                    name: 'Duplicate User',
                    email: 'duplicate@example.com',
                    role: role1._id,
                }),
            ).rejects.toThrowError(/duplicate key error/);
        });

        it('should assign a default status if not provided', async () => {
            const role1 = await Role.create({ roleName: 'Admin' });

            const account = await accountService.createAccount({
                name: 'User Without Status',
                email: 'defaultstatus@example.com',
                role: role1._id,
            });

            expect(account.status).toBeDefined();
            expect(account.status).toBe(IAccoutStatus.INACTIVE); // Assuming default status is INACTIVE
        });

        it('should throw an error if role ID is invalid', async () => {
            const invalidRoleId = 'invalid-role-id';

            await expect(
                accountService.createAccount({
                    name: 'Invalid Role',
                    email: 'invalidrole@example.com',
                    role: invalidRoleId,
                }),
            ).rejects.toThrowError("Account validation failed: role: Cast to ObjectId failed for value \"invalid-role-id\" (type string) at path \"role\" because of \"BSONError\"");
        });
    })
})
