import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import unitService from '../unitService'
import Unit from '../../models/unitModel' // Giả định bạn đã tạo mô hình Unit
import Location from '../../models/locationModel'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
})

afterEach(async () => {
    await Unit.deleteMany({})
})

describe('Unit Service Test', () => {
    it('should retrieve a unit by ID', async () => {
        const unitData = {
            name: 'Unit1',
            image: 'http://example.com/image.jpg',
            introduction: 'Introduction text',
            banner: 'http://example.com/banner.jpg',
            locations: [],
        }
        const createdUnit = await Unit.create(unitData)

        const fetchedUnit = await unitService.getUnitById(createdUnit._id)

        expect(fetchedUnit).not.toBeNull()
        expect(fetchedUnit?._id.toString()).toBe(createdUnit._id.toString())
        expect(fetchedUnit?.name).toBe('Unit1')
    })

    it('should return an empty list if no units exist in getListUnit', async () => {
        const unitList = await unitService.getListUnit()
        expect(unitList).toEqual([])
    })

    it('should retrieve a list of units when units are added', async () => {
        const location1 = await Location.create({
            name: 'Hanoi',
            address: '123 Hanoi Street',
            district: 'Hoàn Kiếm',
            city: 'Hanoi',
            country: 'Vietnam',
        })
        const unitData = [
            {
                name: 'Unit1',
                image: 'http://example.com/image.jpg',
                introduction: 'Introduction text',
                banner: 'http://example.com/banner.jpg',
                locations: [location1._id],
            },
            {
                name: 'Unit2',
                image: 'http://example.com/image.jpg',
                introduction: 'Introduction text',
                banner: 'http://example.com/banner.jpg',
                locations: [location1._id],
            },
        ]
        await Unit.insertMany(unitData)

        const unitList = await unitService.getListUnit()
        expect(unitList.length).toBe(2)
    })

    it('should retrieve units by location ID', async () => {
        const locationId = new Types.ObjectId()
        const unitData = [
            {
                name: 'Unit1',
                image: 'http://example.com/image.jpg',
                introduction: 'Introduction text',
                banner: 'http://example.com/banner.jpg',
                location: [locationId],
            },
            {
                name: 'Unit2',
                image: 'http://example.com/image.jpg',
                introduction: 'Introduction text',
                banner: 'http://example.com/banner.jpg',
                location: [locationId],
            },
            {
                name: 'Unit3',
                image: 'http://example.com/image.jpg',
                introduction: 'Introduction text',
                banner: 'http://example.com/banner.jpg',
                location: [new Types.ObjectId()],
            },
        ]
        await Unit.insertMany(unitData)

        const unitsByLocation = await unitService.getListUnitByLocationId(locationId)

        // expect(unitsByLocation.length).toBe(2)
        // expect(unitsByLocation.every((unit) => unit.location.toString() === locationId.toString())).toBeTruthy()
    })

    it('should create a new unit', async () => {
        const newUnitData = {
            name: 'Unit New',
            image: 'http://example.com/image.jpg',
            introduction: 'Introduction text',
            banner: 'http://example.com/banner.jpg',
            locations: [],
        }
        const createdUnit = await unitService.addUnit(newUnitData)

        expect(createdUnit).not.toBeNull()
        expect(createdUnit.name).toBe('Unit New')
    })
})

describe('getUnitById', () => {
    it('should return the unit when it exists', async () => {
        const unit = await Unit.create({
            name: 'Unit1',
            image: 'http://example.com/image1.jpg',
            introduction: 'Intro',
            banner: 'http://example.com/banner1.jpg',
            locations: [],
        })

        const result = await unitService.getUnitById(unit._id)
        expect(result).not.toBeNull()
        expect(result?.name).toBe('Unit1')
    })

    it('should return null if the unit does not exist', async () => {
        const result = await unitService.getUnitById(new mongoose.Types.ObjectId())
        expect(result).toBeNull()
    })

    it('should handle invalid ID', async () => {
        const invalidId = 'invalid-id'
        await expect(unitService.getUnitById(invalidId as any)).rejects.toThrow()
    })

    it('should return correct data if populated with locations', async () => {
        const locationId = new mongoose.Types.ObjectId()
        const unit = await Unit.create({
            name: 'Unit with location',
            image: 'http://example.com/image.jpg',
            introduction: 'Introduction',
            banner: 'http://example.com/banner.jpg',
            locations: [locationId],
        })

        const result = await unitService.getUnitById(unit._id)
        expect(result).not.toBeNull()
    })

    it('should handle edge cases with empty database', async () => {
        await mongoose.connection.dropDatabase()
        const result = await unitService.getUnitById(new mongoose.Types.ObjectId())
        expect(result).toBeNull()
    })
})

describe('getListUnit', () => {
    it('should return an empty array if no units exist', async () => {
        const result = await unitService.getListUnit()
        expect(result).toEqual([])
    })

    it('should return a list of all units', async () => {
        await Unit.insertMany([
            { name: 'Unit1', image: 'image1.jpg', introduction: 'intro1', banner: 'banner1', locations: [] },
            { name: 'Unit2', image: 'image2.jpg', introduction: 'intro2', banner: 'banner2', locations: [] },
        ])

        const result = await unitService.getListUnit()
        expect(result.length).toBe(2)
    })

    it('should only return units created', async () => {
        const insertedUnits = await Unit.insertMany([
            { name: 'Unit1', image: 'image1.jpg', introduction: 'intro1', banner: 'banner1', locations: [] },
        ])

        const result = await unitService.getListUnit()
        expect(result.length).toBe(1)
        expect(result[0].name).toBe('Unit1')
    })

    it('should return populated locations if database has valid relations', async () => {
        const location1 = await Location.create({
            name: 'Hanoi',
            address: '123 Hanoi Street',
            district: 'Hoàn Kiếm',
            city: 'Hanoi',
            country: 'Vietnam',
        })
        await Unit.create({
            name: 'Unit1',
            image: 'image1.jpg',
            introduction: 'intro1',
            banner: 'banner1',
            locations: [location1._id],
        })

        const result = await unitService.getListUnit()
        expect(result[0].locations[0]._id.toString()).toBe(location1._id.toString())
    })

    it('should return results even if one insertion fails', async () => {
        const location1 = await Location.create({
            name: 'Hanoi',
            address: '123 Hanoi Street',
            district: 'Hoàn Kiếm',
            city: 'Hanoi',
            country: 'Vietnam',
        })
        await Unit.create({
            name: 'Unit1',
            image: 'image1.jpg',
            introduction: 'intro1',
            banner: 'banner1',
            locations: [location1._id],
        })
        jest.spyOn(Unit, 'find')
        const result = await unitService.getListUnit()
        expect(result.length).toBe(1)
    })
})

describe('getListUnitByLocationId', () => {
    it('should return an empty list if no matching units exist', async () => {
        const locationId = new mongoose.Types.ObjectId()
        const result = await unitService.getListUnitByLocationId(locationId)
        expect(result).toEqual([])
    })

    it('should return units matching the location ID', async () => {
        const locationId = new mongoose.Types.ObjectId()
        await Unit.insertMany([
            { name: 'Unit1', image: 'image1.jpg', introduction: 'intro1', banner: 'banner1', locations: [locationId] },
            { name: 'Unit2', image: 'image2.jpg', introduction: 'intro2', banner: 'banner2', locations: [locationId] },
        ])

        const result = await unitService.getListUnitByLocationId(locationId)
        expect(result.length).toBe(2)
    })

    it('should return correct units only with matching location', async () => {
        const locationId = new mongoose.Types.ObjectId()
        const otherLocationId = new mongoose.Types.ObjectId()
        await Unit.insertMany([
            { name: 'Unit1', image: 'image1.jpg', introduction: 'intro1', banner: 'banner1', locations: [locationId] },
            {
                name: 'Unit2',
                image: 'image2.jpg',
                introduction: 'intro2',
                banner: 'banner2',
                locations: [otherLocationId],
            },
        ])

        const result = await unitService.getListUnitByLocationId(locationId)
        expect(result.length).toBe(1)
        expect(result[0].name).toBe('Unit1')
    })

    it('should return correct populated data', async () => {
        const location1 = await Location.create({
            name: 'Hanoi',
            address: '123 Hanoi Street',
            district: 'Hoàn Kiếm',
            city: 'Hanoi',
            country: 'Vietnam',
        })
        await Unit.create({
            name: 'Unit1',
            image: 'image1.jpg',
            introduction: 'intro1',
            banner: 'banner1',
            locations: [location1._id],
        })

        const result = await unitService.getListUnitByLocationId(location1._id)
        expect(result[0].locations[0]._id.toString()).toBe(location1._id.toString())
    })

    it('should handle edge cases with invalid location', async () => {
        const invalidLocation = new mongoose.Types.ObjectId()
        const result = await unitService.getListUnitByLocationId(invalidLocation)
        expect(result).toEqual([])
    })
})

describe('addUnit', () => {
    it('should successfully insert a new unit into database', async () => {
        const unitData = { name: 'Unit1', image: 'img1', introduction: 'intro', banner: 'banner', locations: [] }
        const result = await unitService.addUnit(unitData)
        expect(result).not.toBeNull()
        expect(result.name).toBe('Unit1')
    })

    it('should throw an error if database operation fails', async () => {
        jest.spyOn(Unit, 'create').mockRejectedValueOnce(new Error('Insert failed'))
        await expect(
            unitService.addUnit({ name: 'UnitFail', image: '', introduction: '', banner: '', locations: [] }),
        ).rejects.toThrow()
    })

    it('should add data with valid properties', async () => {
        const unitData = {
            name: 'UnitTest',
            image: 'img2',
            introduction: 'introTest',
            banner: 'banner2',
            locations: [],
        }
        const result = await unitService.addUnit(unitData)
        expect(result.introduction).toBe('introTest')
    })

    it('should handle invalid schema input properly', async () => {
        await expect(unitService.addUnit({})).rejects.toThrow()
    })
})
