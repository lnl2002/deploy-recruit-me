import mongoose, { Document, Schema } from 'mongoose'

export interface ICriteria extends Document {
    career?: mongoose.Types.ObjectId
    name: string
    basic?: {
        detail: string
        weight: string
    }
    beginer?: {
        detail: string
        weight: string
    }
    intermediate?: {
        detail: string
        weight: string
    }
    advanced?: {
        detail: string
        weight: string
    }
    expert?: {
        detail: string
        weight: string
    }
}

export interface ICriteriaDetails extends Document {
    detail: string
    weight: string
}

const criteriaDetails: Schema = new Schema({
    detail: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
})

const criteriaSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    beginer: {
        type: criteriaDetails,
        required: false,
    },
    basic: {
        type: criteriaDetails,
        required: false,
    },
    intermediate: {
        type: criteriaDetails,
        required: false,
    },
    advanced: {
        type: criteriaDetails,
        required: false,
    },
    expert: {
        type: criteriaDetails,
        required: false,
    },
})

const Criteria = mongoose.model<ICriteria>('Criteria', criteriaSchema)

export default Criteria
