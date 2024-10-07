import { Types } from 'mongoose'
import Unit, { IUnit } from '~/models/unitModel'

const unitService = {
    getUnitById: async (unitId: Types.ObjectId): Promise<IUnit | null> => {
        try {
            const account = await Unit.findById(unitId).populate('location')
            return account
        } catch (error) {
            throw new Error('Could not found unit')
        }
    },
}

export default unitService
