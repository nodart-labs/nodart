import { Mutable } from "../mutable";
import { OmitFirstArg } from "./common";

export interface MutableInterface {
  mutable: DataMutable;

  mutate: Mutable<this>;
}

export type DataMutable = {
  [name: string]: (data: object, ...args) => [data: object, exclude?: string[]];
};

export type ResolveDataMutable<T extends MutableInterface> = {
  [K in keyof T["mutable"]]: (
    ...args: Parameters<T["mutable"][K]>
  ) => ReturnType<T["mutable"][K]>[0];
};

export type ResolveDataMutableList<T extends MutableInterface> = {
  [K in keyof T["mutable"]]: (
    data: Parameters<T["mutable"][K]>[0][],
    ...args: OmitFirstArg<T["mutable"][K]>
  ) => ReturnType<T["mutable"][K]>[0][];
};
