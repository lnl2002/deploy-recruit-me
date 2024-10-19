import mongoose, { Document, Schema } from 'mongoose'
import { ICV } from './cvModel'
import { IJob } from './jobModel'
import { ICVStatus } from './cvStatusModel'
import { IAccount } from './accountModel'

export interface IApply extends Document {
    cv: mongoose.Types.ObjectId | ICV
    job: mongoose.Types.ObjectId | IJob
    status: mongoose.Types.ObjectId | ICVStatus
    assigns: mongoose.Types.ObjectId[] | IAccount[]
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
