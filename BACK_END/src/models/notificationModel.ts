import mongoose, { Document, Schema } from 'mongoose'
import { IAccount } from './accountModel'

export interface INotification extends Document {
    receiver: mongoose.Types.ObjectId | IAccount
    content: string
    url: string
    timestamp: Date
}

const notificationSchema: Schema = new Schema(
    {
        receiver: {
            type: mongoose.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: false,
        },
    },
    { timestamps: true },
)

const Notification = mongoose.model<INotification>('Notification', notificationSchema)

export default Notification
