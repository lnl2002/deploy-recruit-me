import mongoose, { Document, Schema } from 'mongoose'
import { IRole } from './roleModel'
import { IUnit } from './unitModel'
import { ICV } from './cvModel'

export interface IAccount extends Document {
    googleId: string
    name: string
    email: string
    role: mongoose.Types.ObjectId | IRole
    unit: mongoose.Types.ObjectId | IUnit
    cvs: mongoose.Types.ObjectId[] | ICV[]
    image: string
    status: IAccoutStatus
}

export enum IAccoutStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}

const accountSchema: Schema = new Schema(
    {
        googleId: {
            type: 'string',
            unique: true,
            trim: true,
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
        cvs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CV',
            },
        ],
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
            default: 'INACTIVE',
        },
    },
    {
        timestamps: true,
        autoIndex: true,
    },
)

const Account = mongoose.model<IAccount>('Account', accountSchema)

export default Account
