import mongoose, { Document, Schema } from 'mongoose'
import { IRole } from './roleModel'

export interface IAccount extends Document {
    googleId: string
    name: string
    email: string
    password: string
    role: mongoose.Types.ObjectId | IRole
    unit: mongoose.Types.ObjectId
    cv: mongoose.Types.ObjectId[],
    image: string
}

const accountSchema: Schema = new Schema(
    {
        googleId: {
            type: 'string',
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        },
        unit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
        },
        image: {
            type: String,
            required: false,
        },
        cv: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CV',
            },
        ],
    },
    {
        timestamps: true,
        autoIndex: true,
    },
)

const Account = mongoose.model<IAccount>('Account', accountSchema)

export default Account
