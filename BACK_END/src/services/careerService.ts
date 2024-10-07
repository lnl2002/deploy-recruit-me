import { Types } from 'mongoose'
import Career, { ICareer } from '~/models/careerModel'

const careerService = {
    getCareerById: async (careerId: Types.ObjectId): Promise<ICareer | null> => {
        try {
            const account = await Career.findById(careerId)
            return account
        } catch (error) {
            throw new Error('Could not found unit')
        }
    },
}

export default careerService
