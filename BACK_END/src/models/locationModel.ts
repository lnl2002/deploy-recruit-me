import mongoose, { Document, Schema } from 'mongoose'

export interface ILocation extends Document {
    city: string
}

const locationSchema: Schema = new Schema({
    city: {
        type: String,
        required: true,
    },
})

const Location = mongoose.model<ILocation>('Location', locationSchema)

export default Location
