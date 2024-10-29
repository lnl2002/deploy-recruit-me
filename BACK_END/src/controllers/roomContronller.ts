// controllers/roomController.js

import { NextFunction, Request, Response } from 'express'
import roomService from '../services/roomService'

const roomContronller = {
    createRoom: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { roomName } = req.body
            if (!roomName) {
                return res.status(400).json({ error: 'Identity is required.' })
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
            if (!identity) {
                return res.status(400).json({ error: 'Identity is required.' })
            }
            const token = roomService.generateAccessToken(identity, roomName)
            res.json({ token })
        } catch (error) {
            next(error)
        }
    },
    endRoom: async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { roomSid } = req.body
            if (!roomSid) {
                return res.status(400).json({ error: 'Identity is required.' })
            }
            const result = await roomService.endRoom(roomSid)

            res.json(result)
        } catch (error) {
            next(error)
        }
    },
}

export default roomContronller
