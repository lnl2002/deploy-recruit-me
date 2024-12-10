import mongoose, { Document, Schema } from 'mongoose'
import { IUnit } from './unitModel'
import { ICareer } from './careerModel'
import { IAccount } from './accountModel'
import { ILocation } from './locationModel'
import { ICriteria } from './criteriaModel'

export interface IJobCriteria extends Document {
    criteriaName: string
    requirement: string
}

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
    criterias: mongoose.Types.ObjectId[] | ICriteria[]
    address: string
    timestamp: Date
    expiredDate: Date
    startDate: Date
    isDelete: boolean
    isActive: boolean
    type: string
    status: string
    rejectReason: string
}

const jobSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        introduction: {
            type: String,
            // required: true,
        },
        description: {
            type: String,
            required: true,
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
            required: true,
            validate: {
                validator: function (this: IJob, v: number) {
                    return v < this.maxSalary // Accessing maxSalary correctly
                },
                message: (props: any) => `${props.value} should be less than maxSalary!`,
            },
        },
        maxSalary: {
            type: Number,
            required: true,
        },
        numberPerson: {
            type: Number,
            required: true,
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
        criterias: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Criteria',
                required: true,
            },
        ],
        address: {
            type: String,
            required: true,
        },
        expiredDate: {
            type: Date,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        isDelete: {
            type: Boolean,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['fulltime', 'parttime', 'hybrid', 'remote', 'remote-fulltime', 'remote-parttime'],
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'expired', 'reopened', 'rejected', 'completed'],
            default: 'pending',
        },
        rejectReason: {
            type: String,
        },
    },
    { timestamps: true },
)

// Tạo model từ schema
const Job = mongoose.model<IJob>('Job', jobSchema)

export default Job
