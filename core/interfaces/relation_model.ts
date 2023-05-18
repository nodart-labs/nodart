import { Orm } from "../orm";
import { BaseModelInterface, OrmQueryBuilder } from "./orm";

export interface RelationModelInterface extends BaseModelInterface {
  table: string;

  orm: Orm;

  query: OrmQueryBuilder;

  model: object;
}

export interface RelationModelStatementInterface {
  statements: RelationModelStatements;
}

export type RelationModelStatements = <
  T extends RelationModelStatementInterface & RelationModelInterface,
>(
  query: T["query"],
) => {
  [K in keyof ReturnType<EmbedRelationModelStatements<T>> | string]: (
    ...args: K extends keyof ReturnType<EmbedRelationModelStatements<T>>
      ? Parameters<ReturnType<EmbedRelationModelStatements<T>>[K]>
      : any
  ) => T["query"] | Promise<any>;
};

export type RelationModelStatementChain<
  E extends RelationModelStatementInterface & RelationModelInterface,
  T extends RelationModelStatementInterface,
  R extends (...args: any) => unknown = undefined,
> = {
  [K in keyof ReturnType<T["statements"]> | "result" | "on"]: K extends "on"
    ? ReturnType<E["statements"]>
    : K extends "result"
    ? ReturnType<R> extends Promise<unknown>
      ? ReturnType<R>
      : Promise<ReturnType<R>>
    : (
        ...args: Parameters<ReturnType<T["statements"]>[K]>
      ) => RelationModelStatementChain<E, T, ReturnType<T["statements"]>[K]>;
};

export type EmbedRelationModelStatements<
  T extends RelationModelStatementInterface & RelationModelInterface,
> = (query: T["query"]) => {
  list: (...args: (keyof T["model"])[]) => Promise<T["model"][]>;
  get: (arg?: EmbedRelationModelStatementProps<T>) => Promise<T["model"]>;
  set: (arg: EmbedRelationModelStatementProps<T>) => any;
  add: (
    arg:
      | EmbedRelationModelStatementProps<T>
      | EmbedRelationModelStatementProps<T>[],
  ) => any;
  delete: (arg: EmbedRelationModelStatementProps<T>) => any;
  at: (arg: EmbedRelationModelStatementProps<T>) => Promise<T["model"][]>;
  use: (callback: (query: T["query"]) => T["query"]) => T["query"];
  exclude: (arg: EmbedRelationModelStatementProps<T>) => Promise<T["model"][]>;
};

export type EmbedRelationModelStatementProps<
  T extends RelationModelStatementInterface & RelationModelInterface,
> = Partial<{
  [K in keyof T["model"]]: any;
}>;
