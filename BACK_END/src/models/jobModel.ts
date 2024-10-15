import mongoose, { Document, Schema } from 'mongoose'

export interface IJob extends Document {
    title: string
    introduction: string
    description: string
    benefits: string
    requests: string
    minSalary: number
    maxSalary: number
    numberPerson: number
    unit: mongoose.Types.ObjectId
    career: mongoose.Types.ObjectId
    account: mongoose.Types.ObjectId
    interviewer: mongoose.Types.ObjectId
    location: mongoose.Types.ObjectId
    address: string
    timestamp: Date
    expiredDate: Date
    isDelete: boolean
    isActive: boolean
    type: string
}

const jobSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        introduction: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        requests: {
            type: String,
            required: true,
        },
        benefits: {
            type: String,
            required: true,
        },
        minSalary: {
            type: Number,
            required: false,
        },
        maxSalary: {
            type: Number,
            required: false,
        },
        numberPerson: {
            type: Number,
            required: false,
        },
        unit: {
            type: mongoose.Types.ObjectId,
            ref: 'Unit',
            required: true,
        },
        location: {
            type: mongoose.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
        career: {
            type: mongoose.Types.ObjectId,
            ref: 'Career',
            required: true,
        },
        account: {
            type: mongoose.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        interviewer: {
            type: mongoose.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        address: {
            type: String,
            required: false,
        },
        expiredDate: {
            type: Date,
            required: true,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            required: true,
            enum: ['fulltime', 'parttime', 'hybrid', 'remote', 'remote-fulltime', 'remote-parttime'],
        },
    },
    { timestamps: true },
)

// Tạo model từ schema
const Job = mongoose.model<IJob>('Job', jobSchema)

export default Job
