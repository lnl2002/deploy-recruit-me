import mongoose, { Document, Schema } from 'mongoose'
import { IAccount } from './accountModel'

export interface IApplicantReport extends Document {
    details: IDetailCriteria[]
    createdBy: mongoose.Types.ObjectId | IAccount
    score: number
    isPass: boolean
}

export interface IDetailCriteria extends Document {
    criteriaName: string
    comment: string
}

const DetailCriteriaSchema: Schema = new Schema({
    criteriaName: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: false,
    },
})

const applicantReportSchema: Schema = new Schema(
    {
        details: {
            type: [DetailCriteriaSchema],
            required: true,
            minlength: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        score: {
            type: Number,
        },
        isPass: {
            type: Boolean,
            required: false,
        },
    },
    { timestamps: true },
)

const ApplicantReport = mongoose.model<IApplicantReport>('ApplicantReport', applicantReportSchema)

export default ApplicantReport
