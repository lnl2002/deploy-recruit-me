// services/twilioService.js
import twilio from 'twilio'
const AccessToken = twilio.jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const apiKeySid = process.env.TWILIO_API_KEY_SID
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET
const client = twilio(accountSid, authToken)

const twilioService = {
    createRoom: async (roomName: string) => {
        try {
            const room = await client.video.v1.rooms.create({
                uniqueName: roomName,
                type: 'group',
            })
            return room
        } catch (error: any) {
            return error.message
        }
    },
    generateAccessToken: (identity: string, roomName?: string) => {
        try {
            const videoGrant = new VideoGrant({ room: roomName || undefined })
            const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { identity })

            token.addGrant(videoGrant)

            return token.toJwt()
        } catch (error: any) {
            return error.message
        }
    },
    endRoom: async (roomSid: string) => {
        try {
            const room = await client.video.v1.rooms(roomSid).update({ status: 'completed' })
            return room
        } catch (error: any) {
            return error.message
        }
    },
    listRoom: async () => {
        try {
            const room = await client.video.v1.rooms.list()
            return room
        } catch (error: any) {
            return error.message
        }
    },
}

export default twilioService
