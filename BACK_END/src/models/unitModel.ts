import mongoose, { Document, Schema } from 'mongoose'
import { ILocation } from './locationModel'

export interface IUnit extends Document {
    name: string
    image: string
    introduction: string
    banner: string
    locations: mongoose.Types.ObjectId[] | ILocation[]
}

const unitSchema: Schema = new Schema({
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
    banner: {
        type: String,
        required: true,
    },
    locations: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
    ],
})

const Unit = mongoose.model<IUnit>('Unit', unitSchema)

export default Unit
