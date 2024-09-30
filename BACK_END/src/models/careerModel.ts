import mongoose, { Document, Schema } from 'mongoose'

export interface ICareer extends Document {
    name: string
    image: string
    introduction: string
}

const careerSchema: Schema = new Schema({
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
})

const Career = mongoose.model<ICareer>('Career', careerSchema)

export default Career
