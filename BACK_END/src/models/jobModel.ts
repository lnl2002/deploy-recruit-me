import mongoose, { Document, Schema } from 'mongoose'

export interface IJob extends Document {
    title: string
    introduction: string
    description: string
    minSalary: number
    maxSalary: number
    numberPerson: number
    unit: mongoose.Types.ObjectId // Tham chiếu tới bảng Units
    career: mongoose.Types.ObjectId // Tham chiếu tới bảng Careers
    account: mongoose.Types.ObjectId
    interviewer: mongoose.Types.ObjectId
    address: string
    timestamp: Date
    expiredDate: Date
    isDelete: boolean
    isActive: boolean
}

const jobSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true, // Bắt buộc phải có tiêu đề công việc
        },
        introduction: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
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
    },
    { timestamps: true },
)

// Tạo model từ schema
const Job = mongoose.model<IJob>('Job', jobSchema)

export default Job
