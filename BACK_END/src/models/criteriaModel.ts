import mongoose, { Document, Schema } from 'mongoose'

export interface ICriteria extends Document {
    career: mongoose.Types.ObjectId
    name: string
}

const criteriaSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    career: {
        type: mongoose.Types.ObjectId,
        ref: 'Career',
        required: true,
    },
})

const Criteria = mongoose.model<ICriteria>('Criteria', criteriaSchema)

export default Criteria
