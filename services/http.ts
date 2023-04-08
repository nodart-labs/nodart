import { HttpAcceptorInterface } from "../core/interfaces/http";
import {
  HttpServiceCallback,
  HttpServiceSubscriber,
} from "../core/interfaces/service";
import { RouteDescriptor } from "../core/interfaces/router";

export class HttpService {
  readonly subscribers: HttpServiceSubscriber[] = [];

  sendRoute(
    route: string | RouteDescriptor,
    action: string,
    callback: HttpServiceCallback,
  ) {
    route = typeof route === "string" ? { path: route } : route;

    this.subscribers.forEach((listen) => listen({ route, action, callback }));
  }

  subscribe(subscriber: HttpServiceSubscriber) {
    this.subscribers.push(subscriber);
  }

  get httpAcceptor(): HttpServiceAcceptor {
    return new HttpServiceAcceptor(this);
  }
}

export class HttpServiceAcceptor implements HttpAcceptorInterface {
  constructor(readonly service: HttpService) {}

  any(route: string | RouteDescriptor, callback: HttpServiceCallback) {
    this.service.sendRoute(route, "any", callback);
  }

  get(route: string | RouteDescriptor, callback: HttpServiceCallback) {
    this.service.sendRoute(route, "get", callback);
  }

  head(route: string | RouteDescriptor, callback: HttpServiceCallback) {
    this.service.sendRoute(route, "head", callback);
  }

  patch(route: string | RouteDescriptor, callback: HttpServiceCallback) {
    this.service.sendRoute(route, "patch", callback);
  }

  post(route: string | RouteDescriptor, callback: HttpServiceCallback) {
    this.service.sendRoute(route, "post", callback);
  }

  put(route: string | RouteDescriptor, callback: HttpServiceCallback) {
    this.service.sendRoute(route, "put", callback);
  }

  delete(route: string | RouteDescriptor, callback: HttpServiceCallback) {
    this.service.sendRoute(route, "delete", callback);
  }

  connect(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "connect", callback);
  }

  copy(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "copy", callback);
  }

  lock(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "lock", callback);
  }

  mkcol(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "mkcol", callback);
  }

  move(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "move", callback);
  }

  options(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "options", callback);
  }

  propfind(
    route: string | RouteDescriptor,
    callback: HttpServiceCallback,
  ): any {
    this.service.sendRoute(route, "propfind", callback);
  }

  proppatch(
    route: string | RouteDescriptor,
    callback: HttpServiceCallback,
  ): any {
    this.service.sendRoute(route, "proppatch", callback);
  }

  search(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "search", callback);
  }

  trace(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "trace", callback);
  }

  unlock(route: string | RouteDescriptor, callback: HttpServiceCallback): any {
    this.service.sendRoute(route, "unlock", callback);
  }
}
