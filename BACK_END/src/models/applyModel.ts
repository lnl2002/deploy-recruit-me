import mongoose, { Document, Schema } from 'mongoose'

export interface IApply extends Document {
    cv: mongoose.Types.ObjectId
    job: mongoose.Types.ObjectId
    status: mongoose.Types.ObjectId
    assigns: mongoose.Types.ObjectId[]
}

const applySchema: Schema = new Schema(
    {
        cv: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CV',
            required: true,
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },
        status: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CVStatus',
            required: true,
        },
        statusUpdatedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Account',
            },
        ],
        statusUpdatedAt: { type: Date },
        assigns: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Account',
            },
        ],
    },
    { timestamps: true },
)

// Tạo model từ schema
const Apply = mongoose.model<IApply>('Apply', applySchema)

export default Apply
