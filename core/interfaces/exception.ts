export interface BaseExceptionInterface {
    exceptionMessage: string
    exceptionData: unknown
}

export interface BaseExceptionHandlerInterface {
    resolve(): PromiseLike<any>
}
