import mongoose, { Document, Schema } from 'mongoose'

export interface ILocation extends Document {
    country: string
    city: string
    district: string
    ward: string
    detailLocation: string
}

const locationSchema: Schema = new Schema({
    country: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    ward: {
        type: String,
    },
    detailLocation: {
        type: String,
    },
})

const Location = mongoose.model<ILocation>('Location', locationSchema)

export default Location
