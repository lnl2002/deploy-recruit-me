import mongoose, { Document, Schema } from 'mongoose'
import { IUnit } from './unitModel'
import { ICareer } from './careerModel'
import { IAccount } from './accountModel'
import { ILocation } from './locationModel'

export interface IJobCriteria extends Document {
    criteriaName: string
    requirement: string
}

const CriteriaSchema: Schema = new Schema({
    criteriaName: {
        type: String,
        required: true,
    },
    requirement: {
        type: String,
        required: false,
    },
})

export interface IJob extends Document {
    title: string
    introduction: string
    description: string
    benefits: string
    requests: string
    minSalary: number
    maxSalary: number
    numberPerson: number
    unit: mongoose.Types.ObjectId | IUnit
    career: mongoose.Types.ObjectId | ICareer
    account: mongoose.Types.ObjectId | IAccount
    interviewManager: mongoose.Types.ObjectId | IAccount
    location: mongoose.Types.ObjectId | ILocation
    address: string
    timestamp: Date
    expiredDate: Date
    isDelete: boolean
    isActive: boolean
    type: string
    status: string
    criterias: IJobCriteria[]
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
        interviewManager: {
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
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'published', 'expired', 'reopened', 'rejected'],
        },
        criterias: [CriteriaSchema],
    },
    { timestamps: true },
)

// Tạo model từ schema
const Job = mongoose.model<IJob>('Job', jobSchema)

export default Job
