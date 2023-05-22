import { App } from "../app";
import { HttpContainer } from "../http_client";
import { BaseController } from "../controller";
import { AnyHttpMethods, RouteData, RouteDescriptor } from "./router";
import { JSONObjectInterface } from "./object";
import { HttpMethod } from "./http";

export type ServiceScope = {
  app?: App;
  http?: HttpContainer;
  route?: Readonly<RouteData>;
  controller?: () => BaseController | void;
  model?: () => any;
  service?: () => any;
  [addon: string]: any;
};

export type HttpServiceCallback = (
  scope: ServiceScope,
) =>
  | Promise<string | JSONObjectInterface | void>
  | string
  | JSONObjectInterface
  | void;

export type HttpServiceRouteObject = {
  route: string | RouteDescriptor;
  method: AnyHttpMethods;
  callback: HttpServiceCallback;
};

export type HttpServiceSubscriber = (data: HttpServiceRouteObject) => void;
