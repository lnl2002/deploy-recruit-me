export interface ApiResponse<T> {
    status: number
    message: string
    data?: T
}

export const sendResponse = <T>(status: number, message: string, data?: T): ApiResponse<T> => {
    return {
        status,
        message,
        data,
    }
}
