import mongoose, { Document, Schema } from 'mongoose'

export interface IRole extends Document {
    roleName: string
}

const roleSchema: Schema = new Schema({
    roleName: {
        type: String,
        required: true,
    },
})

const Role = mongoose.model<IRole>('Role', roleSchema)

export default Role
