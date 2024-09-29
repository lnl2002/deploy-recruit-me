import mongoose, { Document, Schema } from 'mongoose'

export interface IUnit extends Document {
    name: string
    image: string
    introduction: string
    location: mongoose.Types.ObjectId
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
    location: {
        type: mongoose.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
})

const Unit = mongoose.model<IUnit>('Unit', unitSchema)

export default Unit
