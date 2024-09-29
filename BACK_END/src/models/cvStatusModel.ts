import mongoose, { Document, Schema } from 'mongoose'

export interface ICVStatus extends Document {
    name: string
}

const cvStatusSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
})

const CVStatus = mongoose.model<ICVStatus>('CVStatus', cvStatusSchema)

export default CVStatus
