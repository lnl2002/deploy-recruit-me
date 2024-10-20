export interface ITable<T> {
    total: number
    page: number
    totalPages: number
    data: Array<T>
}

export interface IResponse<T> {
    status: number
    message: string
    data: Array<T> | T
}