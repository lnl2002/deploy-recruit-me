import { Types } from 'mongoose'
import Unit, { IUnit } from '../models/unitModel'

const unitService = {
    getUnitById: async (unitId: Types.ObjectId): Promise<IUnit | null> => {
        const unit = await Unit.findById(unitId).populate('location')
        return unit
    },
    getListUnit: async (): Promise<IUnit[] | []> => {
        const listUnit = await Unit.find({}).populate('location')
        return listUnit
    },
    getListUnitByLocationId: async (locationId: Types.ObjectId): Promise<IUnit[] | []> => {
        const listUnit = await Unit.find({ location: locationId }).populate('location')
        return listUnit
    },
    addUnit: async (unit: Partial<IUnit>): Promise<IUnit> => {
        const newUnit = await Unit.create(unit)
        return newUnit
    },
}

export default unitService
