import { Request, Response, NextFunction } from 'express'
import { ApiResponse, sendResponse } from '../utils/helpers/responseHelper'

export const responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json

    res.json = function <T>(data: ApiResponse<T>) {
        const statusCode = res.statusCode !== 200 ? res.statusCode : 200;
        if (res.locals.isError) {
            return originalJson.call(res, data)
        }

        return originalJson.call(res, sendResponse(statusCode, 'Success', data))
    }

    next()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.locals.isError = true

    return res.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: null,
    })
}
