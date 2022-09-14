export type ObjectDeepNestedGeneric<T> = { [key: string]: ObjectDeepNestedGeneric<T> } | T

type JSONValue =
    | string
    | number
    | boolean
    | JSONObjectInterface
    | JSONArrayInterface

export interface JSONObjectInterface {
    [x: string]: JSONValue
}

export interface JSONArrayInterface extends Array<JSONValue> { }

