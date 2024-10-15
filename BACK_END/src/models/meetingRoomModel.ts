import mongoose, { Document, Schema } from 'mongoose'

export interface IParticipantStatus {
    participant: mongoose.Types.ObjectId
    status: IMeetingApproveStatus
}

export enum IMeetingApproveStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface IMeetingRoom extends Document {
    url: string
    participants: IParticipantStatus[]
    timeStart: Date
    rejectCount: number
}

const participantStatusSchema: Schema = new Schema(
    {
        participant: {
            type: mongoose.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    { _id: false },
)

const meetingRoomSchema: Schema = new Schema(
    {
        url: {
            type: String,
            required: true,
        },
        participants: [participantStatusSchema],
        timeStart: {
            type: Date,
            required: true,
        },
        rejectCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: false,
            required: true,
        }
    },
    { timestamps: true },
)

const MeetingRoom = mongoose.model<IMeetingRoom>('MeetingRoom', meetingRoomSchema)

export default MeetingRoom
