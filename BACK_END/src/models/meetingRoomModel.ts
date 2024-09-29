import mongoose, { Document, Schema } from 'mongoose'

export interface IMeetingRoom extends Document {
    url: string
    participants: mongoose.Types.ObjectId[]
    timeStart: Date
}

const meetingRoomSchema: Schema = new Schema(
    {
        url: {
            type: String,
            required: true,
        },
        participants: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Account',
            },
        ],
        timeStart: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true },
)

const MeetingRoom = mongoose.model<IMeetingRoom>('MeetingRoom', meetingRoomSchema)

export default MeetingRoom
