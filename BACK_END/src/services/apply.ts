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

    createApply: async ({ cvId, jobId, defaultStatusId, createdBy }) => {
        try {
            const newApply = new Apply({
                cv: cvId,
                job: jobId,
                status: defaultStatusId,
                createdBy: createdBy,
            })

            const savedApply = await newApply.save()
            return savedApply
        } catch (error) {
            // Handle errors (e.g., log and re-throw)
            console.error('Error creating application in applyService:', error)
            throw error // Re-throw for the controller to handle
        }
    },
}

export default applyService
