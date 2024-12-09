import { Types } from 'mongoose'
import Location, { ILocation } from '../../models/locationModel'
import locationService from '../locationService'

// Mock Mongoose methods
jest.mock('../../models/locationModel', () => {
    return {
        __esModule: true,
        default: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
        },
    }
})

// Mock data
const mockedLocation: ILocation = {
    _id: new Types.ObjectId(),
    country: 'Vietnam',
    city: 'Hanoi',
    district: 'Cau Giay',
    ward: 'Dich Vong Hau',
    detailLocation: '123 Street',
} as ILocation

describe('addLocation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should add a new location successfully', async () => {
        ;(Location.create as jest.Mock).mockResolvedValue(mockedLocation)

        const result = await locationService.addLocation(mockedLocation)

        expect(Location.create).toHaveBeenCalledWith(mockedLocation)
        expect(result).toEqual(mockedLocation)
    })

    it('should throw an error if location data is invalid', async () => {
        ;(Location.create as jest.Mock).mockRejectedValue(new Error('Invalid data'))

        await expect(locationService.addLocation({} as Partial<ILocation>)).rejects.toThrow('Invalid data')
    })

    it('should call Location.create exactly once', async () => {
        ;(Location.create as jest.Mock).mockResolvedValue(mockedLocation)

        await locationService.addLocation(mockedLocation)

        expect(Location.create).toHaveBeenCalledTimes(1)
    })

    it('should return the created location with expected properties', async () => {
        ;(Location.create as jest.Mock).mockResolvedValue(mockedLocation)

        const result = await locationService.addLocation(mockedLocation)

        expect(result).toHaveProperty('country', 'Vietnam')
        expect(result).toHaveProperty('city', 'Hanoi')
    })

    it('should handle empty input gracefully', async () => {
        ;(Location.create as jest.Mock).mockRejectedValue(new Error('Invalid data'))

        await expect(locationService.addLocation({})).rejects.toThrow('Invalid data')
    })

    it('should handle database connection errors', async () => {
        ;(Location.create as jest.Mock).mockRejectedValue(new Error('Database error'))

        await expect(locationService.addLocation(mockedLocation)).rejects.toThrow('Database error')
    })
})

describe('getLocationById', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return a location by ID', async () => {
        ;(Location.findById as jest.Mock).mockResolvedValue(mockedLocation)

        const result = await locationService.getLocationById(mockedLocation._id)

        expect(Location.findById).toHaveBeenCalledWith(mockedLocation._id)
        expect(result).toEqual(mockedLocation)
    })

    it('should return null if location is not found', async () => {
        ;(Location.findById as jest.Mock).mockResolvedValue(null)

        const result = await locationService.getLocationById(new Types.ObjectId())

        expect(result).toBeNull()
    })

    it('should throw an error if an invalid ID is provided', async () => {
        ;(Location.findById as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid ID')
        })

        await expect(locationService.getLocationById('invalid_id' as unknown as Types.ObjectId)).rejects.toThrow(
            'Invalid ID',
        )
    })

    it('should handle database errors gracefully', async () => {
        ;(Location.findById as jest.Mock).mockRejectedValue(new Error('Database error'))

        await expect(locationService.getLocationById(mockedLocation._id)).rejects.toThrow('Database error')
    })

    it('should call Location.findById exactly once', async () => {
        ;(Location.findById as jest.Mock).mockResolvedValue(mockedLocation)

        await locationService.getLocationById(mockedLocation._id)

        expect(Location.findById).toHaveBeenCalledTimes(1)
    })

    it('should not return sensitive data', async () => {
        ;(Location.findById as jest.Mock).mockResolvedValue(mockedLocation)

        const result = await locationService.getLocationById(mockedLocation._id)

        expect(result).not.toHaveProperty('password') // Example for sensitive data
    })
})


describe('getListLocation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return a list of locations', async () => {
        const mockedList = [mockedLocation]
        ;(Location.find as jest.Mock).mockResolvedValue(mockedList)

        const result = await locationService.getListLocation()

        expect(Location.find).toHaveBeenCalledWith()
        expect(result).toEqual(mockedList)
    })

    it('should return an empty array if no locations are found', async () => {
        ;(Location.find as jest.Mock).mockResolvedValue([])

        const result = await locationService.getListLocation()

        expect(result).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
        ;(Location.find as jest.Mock).mockRejectedValue(new Error('Database error'))

        await expect(locationService.getListLocation()).rejects.toThrow('Database error')
    })

    it('should return all locations with expected properties', async () => {
        const mockedList = [mockedLocation]
        ;(Location.find as jest.Mock).mockResolvedValue(mockedList)

        const result = await locationService.getListLocation()

        expect(result[0]).toHaveProperty('country', 'Vietnam')
        expect(result[0]).toHaveProperty('city', 'Hanoi')
    })

    it('should call Location.find exactly once', async () => {
        ;(Location.find as jest.Mock).mockResolvedValue([mockedLocation])

        await locationService.getListLocation()

        expect(Location.find).toHaveBeenCalledTimes(1)
    })

    it('should not include unrelated fields in the result', async () => {
        const mockedList = [mockedLocation]
        ;(Location.find as jest.Mock).mockResolvedValue(mockedList)

        const result = await locationService.getListLocation()

        expect(result[0]).not.toHaveProperty('unrelatedField')
    })
})
