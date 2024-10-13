import Apply, { IApply } from '..//models/applyModel'

const applyService = {
    updateStatus: async ({ applyId, newStatusId }: {applyId: string, newStatusId: string}): Promise<IApply | null> => {

        const updatedApply = await Apply.findByIdAndUpdate(
            applyId,
            { status: newStatusId },
            { new: true }
        )

        return updatedApply
    },
}

export default applyService
