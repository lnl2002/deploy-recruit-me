import mongoose, { Document, Schema } from 'mongoose'

export interface IRole extends Document {
    roleName: string
    roleNumber: number
}

const roleSchema: Schema = new Schema({
    roleName: {
        type: String,
        required: true,
    },
    roleNumber: {
        type: Number,
        required: true,
    },
})

const Role = mongoose.model<IRole>('Role', roleSchema)

export default Role
