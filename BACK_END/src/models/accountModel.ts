import mongoose, { Document, Schema } from 'mongoose'

export interface IAccount extends Document {
    name: string
    email: string
    password: string
    role: mongoose.Types.ObjectId
    unit: mongoose.Types.ObjectId
    cv: mongoose.Types.ObjectId[]
}

const accountSchema: Schema = new Schema(
    {
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
            required: true,
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
