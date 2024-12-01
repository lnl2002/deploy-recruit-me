import Criteria, { ICriteria } from '../models/criteriaModel'

const criteriaService = {
    getListCriteria: async (filterQuery: any): Promise<ICriteria[]> => {
        // return await Criteria.find(filterQuery).populate('career').lean()

        return await Criteria.aggregate([{ $match: filterQuery }])
    },
    addCriteria: async (criteria: Partial<ICriteria>): Promise<ICriteria> => {
        // return await Criteria.find(filterQuery).populate('career').lean()

        return await Criteria.create(criteria)
    },
}

export default criteriaService
