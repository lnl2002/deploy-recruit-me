import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Criteria, { ICriteria } from '../../models/criteriaModel'
import Career from '../../models/careerModel'
import criteriaService from '../criteriaService'

describe('criteriaService', () => {
    let mongoServer: MongoMemoryServer
    let careerId: mongoose.Types.ObjectId

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
        await Criteria.deleteMany({})
        await Career.deleteMany({})

        careerId = (await Career.create({
            name: 'Software Engineer', // Required field
            image: 'image.jpg', // Optional
            introduction: 'An exciting career path!', // Optional
        })) as any as Types.ObjectId
    })

    describe('getListCriteria', () => {
        it('should return an empty array if no criteria match the filter', async () => {
            const filter = { name: 'NonExistentCriteria' }
            const criteriaList = await criteriaService.getListCriteria(filter)
            expect(criteriaList).toEqual([])
        })

        it('should return a list of criteria matching the filter', async () => {
            await Criteria.create({ name: 'Criteria 1', career: careerId })
            await Criteria.create({ name: 'Criteria 2' })

            const criteriaList = await criteriaService.getListCriteria({ career: careerId })
            expect(criteriaList).toHaveLength(1)
        })

        it('should return all criteria if no filter is provided', async () => {
            await Criteria.create([{ name: 'Criteria 1' }, { name: 'Criteria 2' }])
            const criteriaList = await criteriaService.getListCriteria({})
            expect(criteriaList.length).toBeGreaterThanOrEqual(2)
        })

        it('should handle database errors gracefully', async () => {
            const mockError = new Error('Database error')
            jest.spyOn(Criteria, 'aggregate').mockRejectedValue(mockError)

            await expect(criteriaService.getListCriteria({})).rejects.toThrow(mockError)
            jest.restoreAllMocks()
        })

        it('should return an array of ICriteria objects', async () => {
            await Criteria.create({ name: 'Criteria 1' })
            const criteriaList = await criteriaService.getListCriteria({})

            expect(Array.isArray(criteriaList)).toBe(true)
        })

        it('should correctly apply multiple filter conditions', async () => {
            await Criteria.create({ name: 'Criteria 1', career: careerId })
            await Criteria.create({ name: 'Criteria 2' })

            const criteriaList = await criteriaService.getListCriteria({ career: careerId })

            expect(criteriaList).toHaveLength(1)
            expect(criteriaList[0].name).toBe('Criteria 1')
        })

        // Test cases for other filter queries, edge cases, etc. can be added here.
    })

    describe('addCriteria', () => {
        it('should add a new criteria with all fields', async () => {
            const criteriaData: Partial<ICriteria> = {
                name: 'New Criteria',
                basic: { detail: 'Basic details', weight: '5' },
                beginer: { detail: 'beginer details', weight: '5' },
                intermediate: { detail: 'intermediate details', weight: '5' },
                advanced: { detail: 'advanced details', weight: '5' },
                expert: { detail: 'expert details', weight: '5' },
            }
            const newCriteria = await criteriaService.addCriteria(criteriaData)
            expect(newCriteria.name).toBe('New Criteria')
            expect(newCriteria.basic?.detail).toBe('Basic details')
        })

        it('should add a new criteria with only required fields', async () => {
            const newCriteria = await criteriaService.addCriteria({ name: 'New Criteria' })
            expect(newCriteria.name).toBe('New Criteria')
        })

        it('should handle errors gracefully', async () => {
            await expect(criteriaService.addCriteria({} as any)).rejects.toThrow() // Missing required name
        })

        it('should return the newly added criteria', async () => {
            const newCriteria = await criteriaService.addCriteria({ name: 'New Criteria 2' })
            expect(newCriteria).toBeDefined()
            expect(newCriteria.name).toEqual('New Criteria 2')
        })

        it('should add a criteria with correct detail and weight', async () => {
            const criteriaData = {
                name: 'New Criteria 3',
                basic: { detail: 'basic details', weight: '10' },
            }
            const newCriteria = await criteriaService.addCriteria(criteriaData)

            expect(newCriteria.basic).toMatchObject(criteriaData.basic)
        })

        it('should save the new criteria to the database', async () => {
            await criteriaService.addCriteria({ name: 'New Criteria' })

            const saved = await Criteria.findOne({ name: 'New Criteria' })
            expect(saved).not.toBeNull()
        })
    })
})
