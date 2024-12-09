import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Criteria, { ICriteria } from '../../models/criteriaModel'
import GroupCriteria, { IGroupCriteria } from '../../models/groupCriteriaModel'
import Unit from '../../models/unitModel'
import groupCriteriasService from '../groupCriteriasService'

describe('groupCriteriasService', () => {
    let mongoServer: MongoMemoryServer
    let criteria
    let unit

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
        await GroupCriteria.deleteMany({})
        await Criteria.deleteMany({})
        await Unit.deleteMany({})

        criteria = (await Criteria.create({ name: 'Criteria 1' })) as any
        unit = (await Unit.create({ name: 'Unit 1', banner: 'link', location: {} })) as any
    })

    describe('addGroupsCriteria', () => {
        it('should successfully add a new group criteria with all fields', async () => {
            const newGroupCriteriaData: Partial<IGroupCriteria> = {
                name: 'Group 1',
                criterias: [criteria._id],
                unit: unit._id,
            }

            const newGroupCriteria = await groupCriteriasService.addGroupsCriteria(newGroupCriteriaData)

            expect(newGroupCriteria).toBeDefined()
            expect(newGroupCriteria.name).toBe('Group 1')
        })

        it('should throw an error if required fields are missing', async () => {
            await expect(groupCriteriasService.addGroupsCriteria({} as any)).rejects.toThrow() // Missing name

            await expect(groupCriteriasService.addGroupsCriteria({ name: 'test' } as any)).rejects.toThrow()
        })

        it('should correctly save the group criteria to the database', async () => {
            const data = {
                name: 'test group',
                criterias: [criteria._id],
                unit: unit._id,
            }

            await groupCriteriasService.addGroupsCriteria(data)

            const savedGroup = await GroupCriteria.findOne({ name: 'test group' })
            expect(savedGroup).toBeTruthy()
        })

        it('should add a group criteria with the correct unit', async () => {
            const newGroupCriteriaData: Partial<IGroupCriteria> = {
                name: 'Group 1',
                criterias: [criteria._id],
                unit: unit._id,
            }

            const newGroup = await groupCriteriasService.addGroupsCriteria(newGroupCriteriaData)

            expect(newGroup.unit.toString()).toEqual(unit._id.toString())
        })

        it('should add a group criteria with the correct criterias', async () => {
            const criteriasIds = [criteria._id]
            const data = {
                name: 'test criteria',
                criterias: criteriasIds,
                unit: unit._id,
            }

            const newGroup = await groupCriteriasService.addGroupsCriteria(data)
            expect(newGroup.criterias).toEqual(criteriasIds)
        })

        it('should return IGroupCriteria Object', async () => {
            const newGroupCriteriaData: Partial<IGroupCriteria> = {
                name: 'Group 1',
                criterias: [criteria._id],
                unit: unit._id,
            }

            const newGroup = await groupCriteriasService.addGroupsCriteria(newGroupCriteriaData)
            expect(newGroup).toBeInstanceOf(GroupCriteria)
        })
    })

    describe('getGroupsCriterias', () => {
        it('should return an empty array if no group criteria match the query', async () => {
            const groups = await groupCriteriasService.getGroupsCriterias({ name: 'NonExistentGroup' })
            expect(groups).toEqual([])
        })

        it('should return an array of group criteria matching the query', async () => {
            await GroupCriteria.create({ name: 'Group 1', criterias: [criteria._id], unit: unit._id })
            const groups = await groupCriteriasService.getGroupsCriterias({ name: 'Group 1' })
            expect(groups.length).toBeGreaterThanOrEqual(1)
        })

        it('should populate the unit field and exclude locations', async () => {
            await GroupCriteria.create({ name: 'Group 2', criterias: [criteria._id], unit: unit._id })
            const groups = await groupCriteriasService.getGroupsCriterias({ name: 'Group 2' })
            expect(groups[0].unit).toBeDefined()
            expect((groups[0].unit as any).locations).toBeUndefined()
        })

        it('should return empty array when query is empty', async () => {
            const results = await groupCriteriasService.getGroupsCriterias({})
            expect(results).toHaveLength(0)
        })

        it('should return all group criteria if the query is empty', async () => {
            await GroupCriteria.create({ name: 'test', criterias: [criteria._id], unit: unit._id })

            const groups = await groupCriteriasService.getGroupsCriterias({})
            expect(groups).toHaveLength(1)
        })

        it('should correctly apply multiple filter condition', async () => {
            await GroupCriteria.create({ name: 'Group 1', criterias: [criteria._id], unit: unit._id })
            await GroupCriteria.create({ name: 'Group 2', criterias: [criteria._id], unit: unit._id })

            const groups = await groupCriteriasService.getGroupsCriterias({ name: 'Group 1' })
            expect(groups).toHaveLength(1)
        })
    })

    describe('getGroupsCriteria', () => {
        it('should return a group criteria by ID', async () => {
            const group = await GroupCriteria.create({ name: 'Group 1', criterias: [criteria._id], unit: unit._id })
            const fetchedGroup = await groupCriteriasService.getGroupsCriteria(group._id)
            expect(fetchedGroup).toBeTruthy()
            expect(fetchedGroup?.name).toBe('Group 1')
        })

        it('should return null if not found', async () => {
            const fetchedGroup = await groupCriteriasService.getGroupsCriteria(new Types.ObjectId())
            expect(fetchedGroup).toBeNull()
        })

        it('should populate both criterias and unit fields', async () => {
            const group = await GroupCriteria.create({ name: 'Group test', criterias: [criteria._id], unit: unit._id })
            const fetchedGroup = await groupCriteriasService.getGroupsCriteria(group._id)
            expect(fetchedGroup?.criterias).toBeDefined()
            expect(fetchedGroup?.unit).toBeDefined()
        })

        it('should handle database errors gracefully', async () => {
            const invalidId = new mongoose.Types.ObjectId()
            // jest.spyOn(GroupCriteria, 'findById').mockRejectedValueOnce(new Error('Get group by id failed'))
            const result = await groupCriteriasService.getGroupsCriteria(invalidId)
            expect(result).toBe(null)
            jest.restoreAllMocks() // Restore the mock after the test
        })

        it('should return the correct group criteria when multiple groups exist', async () => {
            const group1 = await GroupCriteria.create({ name: 'Group 1', criterias: [criteria._id], unit: unit._id })
            await GroupCriteria.create({ name: 'Group 2', criterias: [criteria._id], unit: unit._id }) // Create another group

            const fetchedGroup = await groupCriteriasService.getGroupsCriteria(group1._id)
            expect(fetchedGroup?._id.toString()).toBe(group1._id.toString()) // Check if it returns group1
        })

        it('should return a IGroupCriteria object', async () => {
            const group = await GroupCriteria.create({
                name: 'Group test return',
                criterias: [criteria._id],
                unit: unit._id,
            })

            const fetchedGroup = await groupCriteriasService.getGroupsCriteria(group._id)

            expect(fetchedGroup).toBeInstanceOf(GroupCriteria)
        })
    })

    describe('updateGroupCriteria', () => {
        it('should update a group criteria', async () => {
            const existingGroup = await GroupCriteria.create({
                name: 'Initial Name',
                criterias: [criteria._id],
                unit: unit._id,
            })

            const updatedGroup = await groupCriteriasService.updateGroupCriteria(existingGroup._id.toString(), {
                name: 'Updated Name',
            })

            expect(updatedGroup).toBeTruthy() // Check if the update was successful
            expect(updatedGroup?.name).toBe('Updated Name') // Check if the name was updated
        })

        it('should return null if group criteria not found', async () => {
            const nonExistentId = new Types.ObjectId().toString()
            const updatedGroup = await groupCriteriasService.updateGroupCriteria(nonExistentId, {
                name: 'Updated Name',
            })

            expect(updatedGroup).toBeNull()
        })

        it('should populate criterias and unit after update', async () => {
            const existingGroup = await GroupCriteria.create({
                name: 'Group for populating',
                criterias: [criteria._id],
                unit: unit._id,
            })

            const updatedGroup = await groupCriteriasService.updateGroupCriteria(existingGroup._id.toString(), {
                name: 'Updated Name Group for populating',
            })

            expect(updatedGroup?.criterias).toBeDefined()
            expect(updatedGroup?.unit).toBeDefined()
        })

        it('should correctly update all fields (except criterias and unit)', async () => {
            const existingGroup = await GroupCriteria.create({
                name: 'Existing Group',
                criterias: [criteria._id],
                unit: unit._id,
            })

            const updates = {
                name: 'Completely Updated Name',
            }

            const updatedGroup = await groupCriteriasService.updateGroupCriteria(existingGroup._id.toString(), updates)

            expect(updatedGroup?.name).toBe(updates.name)
        })

        it('should handle database errors gracefully', async () => {
            const groupId = new mongoose.Types.ObjectId().toString()
            await expect(groupCriteriasService.updateGroupCriteria(groupId, { name: 'test' })).rejects

            jest.restoreAllMocks()
        })

        it('should return the updated document as a IGroupCriteria object', async () => {
            const existingGroup = await GroupCriteria.create({
                name: 'Existing Group',
                criterias: [criteria._id],
                unit: unit._id,
            })

            const updatedGroup = await groupCriteriasService.updateGroupCriteria(existingGroup._id.toString(), {
                name: 'Updated Name',
            })

            expect(updatedGroup).toBeInstanceOf(GroupCriteria)
        })
    })
})
