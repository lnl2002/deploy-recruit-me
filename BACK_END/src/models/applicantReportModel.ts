import mongoose, { Document, Schema } from 'mongoose'

export interface IApplicantReport extends Document {
    name: string
    image: string
    introduction: string
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
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false,
        },
        introduction: {
            type: String,
            required: false,
        },
        detail: DetailCriteriaSchema,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        comment: {
            type: String,
        },
        isPass: {
            type: Boolean,
            required: true,
        },
    },
    { timestamps: true },
)

const ApplicantReport = mongoose.model<IApplicantReport>('ApplicantReport', applicantReportSchema)

export default ApplicantReport
