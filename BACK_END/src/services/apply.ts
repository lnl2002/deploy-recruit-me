import { Types } from 'mongoose'
import Apply, { IApply } from '..//models/applyModel'

const applyService = {
    updateStatus: async ({
        applyId,
        newStatusId,
    }: {
        applyId: string
        newStatusId: string
    }): Promise<IApply | null> => {
        const updatedApply = await Apply.findByIdAndUpdate(applyId, { status: newStatusId }, { new: true })

        return updatedApply
    },

    getApplyListByJob: async (jobId: Types.ObjectId): Promise<IApply[] | []> => {
        const applies = await Apply.find({ job: jobId })
            .populate('cv')
            .populate('job')
            .populate('status')
            .populate('assigns')

        return applies
    },
}

export default applyService
