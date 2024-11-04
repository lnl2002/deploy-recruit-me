import mongoose, { Document, Schema } from 'mongoose'

export interface ICVStatus extends Document {
    name: string
}

const cvStatusSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: [
            'New',
            'Shortlist',
            'Interview Pending',
            'Interview Rescheduled',
            'Approval Interview Scheduled',
            'Interviewed',
            'Accepted',
            'Interview Scheuled',
            'Rejected',
        ],
    },
})

const CVStatus = mongoose.model<ICVStatus>('CVStatus', cvStatusSchema)

export default CVStatus
