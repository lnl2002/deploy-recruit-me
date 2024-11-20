import mongoose, { Document, Schema } from 'mongoose'

export interface IGroupCriteria extends Document {
    criterias: mongoose.Types.ObjectId[]
    unit: mongoose.Types.ObjectId
    name: string
}

const groupCriteriaSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    criterias: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Criteria',
            required: true,
        },
    ],
    unit: {
        type: mongoose.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
})

const GroupCriteria = mongoose.model<IGroupCriteria>('GroupCriteria', groupCriteriaSchema)

export default GroupCriteria
