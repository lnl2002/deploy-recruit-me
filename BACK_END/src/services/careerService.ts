import { Types } from 'mongoose'
import Career, { ICareer } from '../models/careerModel'

const careerService = {
    getCareerById: async (careerId: Types.ObjectId): Promise<ICareer | null> => {
        const career = await Career.findById(careerId)
        return career
    },
    addCareer: async (career: Partial<ICareer>): Promise<ICareer | null> => {
        const newCareer = await Career.create(career)
        return newCareer
    },
    getListCareer: async (): Promise<ICareer[] | []> => {
        const listCareer = await Career.find({})
        return listCareer
    },
}

export default careerService
