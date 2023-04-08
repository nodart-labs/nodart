import { App } from "../app";
import { HttpContainer } from "../http_client";
import { BaseController } from "../controller";
import { RouteData, RouteDescriptor } from "./router";
import { JSONObjectInterface } from "./object";

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
  action: string;
  callback: HttpServiceCallback;
};

export type HttpServiceSubscriber = (data: HttpServiceRouteObject) => void;
