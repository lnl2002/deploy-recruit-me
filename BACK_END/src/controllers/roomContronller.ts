import mongoose from 'mongoose'
import { NextFunction, Request, Response } from 'express'
import roomService from '../services/roomService'
import meetingService from '../services/meetingRoom'
import accountService from '../services/accountService'

const roomContronller = {
    createRoom: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { roomName } = req.body
            if (!roomName) {
                return res.status(400).json('Identity is required')
            }
            const room = await roomService.createRoom(roomName)
            return res.json(room)
        } catch (error) {
            next(error)
        }
    },
    getAccessToken: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { identity, roomName } = req.body
            const account = req.user

            if (!identity) {
                return res.status(400).json({ message: 'Identity is required' })
            }

            if (!roomName) {
                return res.status(400).json({ message: 'Room name is required' })
            }

            const meetingRoom = await meetingService.getMeetingRoom(roomName)

            if (!meetingRoom) {
                return res.status(404).json({ message: 'Room is not found!' })
            }

            const checkParticipant = meetingRoom.participants.find((obj) => obj.participant?.toString() === account._id)

            if (!checkParticipant) {
                return res.status(401).json({ message: 'You can not join this room' })
            }

            const startTime = new Date(meetingRoom.timeStart).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
            const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })

            const startDate = new Date(startTime)
            const currentDate = new Date(currentTime)
            if (startDate > currentDate) {
                return res.status(400).json({ message: 'The meeting has not started yet' })
            }

            const token = roomService.generateAccessToken(identity, roomName)
            res.json(token)
        } catch (error) {
            next(error)
        }
    },
    endRoom: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { roomSid } = req.body
            if (!roomSid) {
                return res.status(400).json('Identity is required')
            }
            const result = await roomService.endRoom(roomSid)

            res.json(result)
        } catch (error) {
            next(error)
        }
    },
    listRoom: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await roomService.listRoom()
            res.json(result)
        } catch (error) {
            next(error)
        }
    },
}

export default roomContronller
