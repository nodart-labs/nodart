import { BaseController } from "../controller";
import { HttpServiceCallback } from "./service";
import { HttpMethod } from "./http";

export type RouterEntries = {
  [path: string]: { [K in HttpMethod]?: RouteData };
};

export type RouterParamEntries = { [K in HttpMethod]?: RouterParamEntryRoutes };

export type RouterParamEntryRoutes = Array<RouteData>;

export type RouterParamsData = {
  [routePath: string]: {
    index: { [index: string]: string };
    names: string[];
    types: { [name: string]: { optional?: boolean; number?: boolean } };
    path: string[];
  };
};

export type RouteEntry = { [name: string]: Route };

export type Route = string | RouteDescriptor | Array<string | RouteDescriptor>;

export type RouteDescriptorParamTypes =
  | typeof Number
  | RegExp
  | ((value: any) => any);

export type RouteDescriptor = {
  path: string;
  name?: string;
  action?: string;
  controller?: (route: RouteData) => typeof BaseController;
  types?: { [param: string]: RouteDescriptorParamTypes };
  [addon: string]: any;
};

export type RouteData = RouteDescriptor & {
  pathname: string;
  route?: string;
  params?: { [name: string]: string | number };
  callback?: HttpServiceCallback;
};
