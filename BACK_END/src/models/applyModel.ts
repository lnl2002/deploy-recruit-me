import mongoose, { Document, Schema } from 'mongoose'
import { ICV } from './cvModel'
import { IJob } from './jobModel'
import { ICVStatus } from './cvStatusModel'
import { IAccount } from './accountModel'
import { IApplicantReport } from './applicantReportModel'

export interface IApply extends Document {
    cv: mongoose.Types.ObjectId | ICV
    job: mongoose.Types.ObjectId | IJob
    status: mongoose.Types.ObjectId | ICVStatus
    statusUpdatedBy: mongoose.Types.ObjectId | IAccount[]
    createdBy: mongoose.Types.ObjectId | IAccount
    assigns: mongoose.Types.ObjectId[] | IAccount[]
    applicantReports: mongoose.Types.ObjectId[] | IApplicantReport[]
    statusUpdatedAt: Date
    cvScore?: {
        averageScore: string
        detailScore: {
            criterionId: mongoose.Types.ObjectId
            criterion: string
            score: string
            explanation: string
        }[]
    }
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        applicantReports: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ApplicantReport',
                required: false,
            },
        ],
        statusUpdatedAt: { type: Date },
        assigns: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Account',
            },
        ],
        cvScore: {
            averageScore: { type: String, required: false },
            detailScore: [
                {
                    criterionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Criteria', required: true },
                    criterion: { type: String, required: true },
                    score: { type: String, required: true },
                    explanation: { type: String, required: true },
                },
            ],
        },
    },
    { timestamps: true },
)

// Tạo model từ schema
const Apply = mongoose.model<IApply>('Apply', applySchema)

export default Apply
