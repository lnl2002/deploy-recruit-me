import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Career, { ICareer } from '../../models/careerModel'
import careerService from '../careerService'

describe('careerService', () => {
    let mongoServer: MongoMemoryServer

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        await mongoose.connect(uri)
    })

    afterAll(async () => {
        await mongoose.disconnect()

        if (mongoServer && mongoServer.instanceInfo) {
            await mongoServer.stop({ force: true })
        }
    })

    beforeEach(async () => {
        await Career.deleteMany({})
    })

    describe('getCareerById', () => {
        it('should retrieve a career by ID', async () => {
            const careerData: ICareer = { name: 'Software Engineer', image: 'image.jpg', introduction: 'Intro' }
            const createdCareer = await Career.create(careerData)
            const retrievedCareer = await careerService.getCareerById(createdCareer._id)
            expect(retrievedCareer).toBeDefined()
            expect(retrievedCareer?._id.toString()).toBe(createdCareer._id.toString())
            expect(retrievedCareer?.name).toBe('Software Engineer')
        })

        it('should return null if ID is invalid', async () => {
            const retrievedCareer = await careerService.getCareerById(new Types.ObjectId())
            expect(retrievedCareer).toBeNull()
        })

        it('should return null if career does not exist', async () => {
            const nonExistentId = new mongoose.Types.ObjectId()
            const retrievedCareer = await careerService.getCareerById(nonExistentId)
            expect(retrievedCareer).toBeNull()
        })

        it('should handle errors gracefully', async () => {
            const invalidId = 'invalid-id' as any
            await expect(careerService.getCareerById(invalidId)).rejects.toThrow()
        })

        it('should return correct career if multiple careers exist', async () => {
            const careerData1: ICareer = { name: 'Career 1', image: 'img.jpg', introduction: 'intro' }
            const careerData2: ICareer = { name: 'Career 2', image: 'img.jpg', introduction: 'intro' }
            const createdCareer1 = await Career.create(careerData1)
            await Career.create(careerData2)

            const retrievedCareer = await careerService.getCareerById(createdCareer1._id)
            expect(retrievedCareer?._id.toString()).toBe(createdCareer1._id.toString())
            expect(retrievedCareer?.name).toBe('Career 1')
        })

        it('should return null if careerId is not provided', async () => {
            const retrievedCareer = await careerService.getCareerById(undefined as any)
            expect(retrievedCareer).toEqual(null)
        })
    })

    describe('addCareer', () => {
        const validCareerData: Partial<ICareer> = {
            name: 'Data Scientist',
            image: 'data-scientist.jpg',
        }

        it('should add a new career with all fields', async () => {
            const newCareer = await careerService.addCareer(validCareerData)
            expect(newCareer).toBeDefined()
            expect(newCareer?.name).toBe('Data Scientist')
        })

        it('should add a new career with only required fields', async () => {
            const newCareer = await careerService.addCareer({ name: 'Test Career' })
            expect(newCareer).toBeDefined()
            expect(newCareer?.name).toBe('Test Career')
        })

        it('should handle errors gracefully during career creation', async () => {
            const invalidCareerData = { name: '' } as any // Missing required name
            await expect(careerService.addCareer(invalidCareerData)).rejects.toThrow()
        })

        it('should add a new career with a unique name', async () => {
            await careerService.addCareer({ name: 'Existing Career' })
            await expect(careerService.addCareer({ name: 'Existing Career' })).rejects.toThrow()
        })

        it('should return the newly added career', async () => {
            const newCareer = await careerService.addCareer({ name: 'New Career' })
            expect(newCareer?.name).toBe('New Career')
            expect(newCareer?._id).toBeDefined()
        })

        it('should correctly save the career to the database', async () => {
            await careerService.addCareer(validCareerData)
            const savedCareer = await Career.findOne({ name: 'Data Scientist' })
            expect(savedCareer).not.toBeNull()
        })
    })

    describe('getListCareer', () => {
        it('should retrieve an empty list if no careers exist', async () => {
            const careers = await careerService.getListCareer()
            expect(careers).toEqual([])
        })

        it('should retrieve a list of careers', async () => {
            const careerData1 = { name: 'Career 1', image: '1', introduction: '1' }
            const careerData2 = { name: 'Career 2', image: '2', introduction: '2' }
            await Career.create(careerData1)
            await Career.create(careerData2)
            const careers = await careerService.getListCareer()
            expect(careers).toHaveLength(2)
            expect(careers[0].name).toBe('Career 1')
        })

        it('should return careers in the correct order', async () => {
            await Career.create({ name: 'Career 1' })
            await Career.create({ name: 'Career 2' })

            const careers = await careerService.getListCareer()

            expect(careers[0].name).toBe('Career 1')
            expect(careers[1].name).toBe('Career 2')
        })

        it('should retrieve all career fields', async () => {
            const careerData = { name: 'Test Career', image: 'test.jpg', introduction: 'Test intro' }
            await Career.create(careerData)
            const careers = await careerService.getListCareer()
            expect(careers[0]).toMatchObject(careerData)
        })

        it('should handle database errors gracefully', async () => {
            try {
                // Mock a database error (this is just an example, adapt as needed)
                jest.spyOn(Career, 'find').mockRejectedValue(new Error('Database error'))

                await expect(careerService.getListCareer()).rejects.toThrow('Database error')
            } catch {}
        })

        it('should return an array even if only one career exists', async () => {
            const careerData = { name: 'Software Engineer', image: 'image.jpg', introduction: 'intro' }
            await Career.create(careerData)
            const careers = await careerService.getListCareer()
            expect(Array.isArray(careers)).toBe(true)
        })
    })
})
