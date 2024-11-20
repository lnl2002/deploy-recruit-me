import mongoose from 'mongoose'
import GroupCriteria, { IGroupCriteria } from '../models/groupCriteriaModel'

const groupCriteriasService = {
    addGroupsCriteria: async (data: Partial<IGroupCriteria>): Promise<IGroupCriteria> => {
        const newCriterias = await GroupCriteria.create(data)
        return newCriterias
    },
    getGroupsCriterias: async (query: any): Promise<IGroupCriteria[]> => {
        const newCriterias = await GroupCriteria.find(query)
            .populate({
                path: 'unit',
                select: '-locations',
            })
            .select('-criterias')
        return newCriterias
    },
    getGroupsCriteria: async (id: mongoose.Types.ObjectId): Promise<IGroupCriteria> => {
        const newCriterias = await GroupCriteria.findById(id).populate('criterias unit')
        return newCriterias
    },
    updateGroupCriteria: async (id: string, updates: Partial<IGroupCriteria>): Promise<IGroupCriteria | null> => {
        return GroupCriteria.findByIdAndUpdate(id, updates, { new: true }).populate('criterias').populate('unit').exec()
    },
}

export default groupCriteriasService
