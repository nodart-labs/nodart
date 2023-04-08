export type ObjectDeepNestedGeneric<T> =
  | { [key: string]: ObjectDeepNestedGeneric<T> }
  | T;

type JSONValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | JSONObjectInterface
  | JSONArrayInterface;

export interface JSONObjectInterface {
  [x: string]: JSONValue;
}

export interface JSONArrayInterface extends Array<JSONValue> {}

export interface JSONLikeInterface {
  [x: string]: any;
}

export type FunctionArgumentParseData = {
  arg: string;
  type:
    | "string"
    | "number"
    | "object"
    | "array"
    | "function"
    | "boolean"
    | undefined;
  default: string;
  required: boolean;
  src: string;
};
