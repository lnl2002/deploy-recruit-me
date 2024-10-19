import { Types } from 'mongoose'
import Location, { ILocation } from '../models/locationModel'

const locationService = {
    addLocation: async (location: Partial<ILocation>): Promise<ILocation> => {
        const newLocation = await Location.create(location)
        return newLocation
    },
    getLocationById: async (locationId: Types.ObjectId): Promise<ILocation> => {
        const location = await Location.findById(locationId)
        return location
    },
    getListLocation: async (): Promise<ILocation[] | []> => {
        const listLocation = await Location.find()
        return listLocation
    },
}

export default locationService
