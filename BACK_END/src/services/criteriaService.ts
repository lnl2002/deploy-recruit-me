import Criteria, { ICriteria } from '../models/criteriaModel'

const criteriaService = {
    getListCriteria: async (filterQuery: any): Promise<ICriteria[]> => {
        // return await Criteria.find(filterQuery).populate('career').lean()

        return await Criteria.aggregate([
            { $match: filterQuery },
            {
                $lookup: {
                    from: 'careers',
                    localField: 'career',
                    foreignField: '_id',
                    as: 'career',
                },
            },
            { $unwind: '$career' },
            { $project: { name: 1, career: '$career.name' } },
        ])
    },
}

export default criteriaService
