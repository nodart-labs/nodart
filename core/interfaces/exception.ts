export interface BaseExceptionInterface {
  exceptionMessage: string;
  exceptionData: unknown;
}

export interface BaseExceptionHandlerInterface {
  resolve(): PromiseLike<any>;
}

export type ExceptionDump = {
  query: string;
  error: any;
  httpStatusCode?: number;
};
