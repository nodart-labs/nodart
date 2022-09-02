export interface BaseModelInterface {
   queryBuilder?: unknown
   orm?: ConnectionManagerInterface
   get query(): unknown
}

export interface ConnectionManagerInterface {
   client?: unknown
   connect(connectionConfig: unknown, ...args: any): unknown
}
