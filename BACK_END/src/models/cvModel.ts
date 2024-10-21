import mongoose, { Document, Schema } from 'mongoose'

export interface ICV extends Document {
    email: string
    lastName: string
    firstName: string
    gender: string
    dob: Date
    phoneNumber: string
    address: string
    url: string
}

const cvSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: false,
    },
    dob: {
        type: Date,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: false,
    },
    url: {
        type: String,
        required: false,
    },
})

const CV = mongoose.model<ICV>('CV', cvSchema)

export default CV
