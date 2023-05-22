import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { $ } from "../utils";
import { App, loaders } from "./app";
import { HttpClient, HttpContainer, JSON_CONTENT_TYPE } from "./http_client";
import { HTTP_STATUS } from "./interfaces/http";
import { JSONLikeInterface } from "./interfaces/object";
import { RouteData } from "./interfaces/router";
import { BaseController, CONTROLLER_INITIAL_ACTION } from "./controller";

export class HttpHandler {
  public static warnings: {
    useCors: boolean;
    serveStatic: boolean;
    fetchDataOnRequest: boolean;
  } = {
    useCors: false,
    serveStatic: false,
    fetchDataOnRequest: false,
  };

  public http: HttpContainer;

  public url = "";

  constructor(
    readonly app: App,
    readonly request: Http2ServerRequest,
    readonly response: Http2ServerResponse,
  ) {}

  setCors() {
    if (this.app.config.get.http.useCors) {
      HttpClient.setCorsHeaders(this.response);

      if (this.request.method === "OPTIONS") {
        this.response.writeHead(HTTP_STATUS.OK, {
          "Content-Type": JSON_CONTENT_TYPE,
        });
        this.response.end();

        return;
      }
    } else if (!HttpHandler.warnings.useCors) {
      HttpHandler.warnings.useCors = true;

      console.warn("The CORS headers are disabled in configuration.");
    }
  }

  serveStatic(callback: (result?: string | boolean | undefined) => any) {
    if (this.app.config.get.static.serve) {
      const pathname = this.request.url.includes("?")
        ? this.request.url.split("?")[0]
        : this.request.url;
      const path = loaders().static.call([this.app.config.get], pathname);

      if (!path) return callback(path);

      loaders().static.serve(path, {
        app: this.app,
        mimeTypes: HttpClient.mimeTypes(this.app.config.get.http.mimeTypes),
        request: this.request,
        response: this.response,
        callback,
      });
    } else {
      callback();

      if (!HttpHandler.warnings.serveStatic) {
        HttpHandler.warnings.serveStatic = true;

        console.warn("Static files serve is disabled in configuration.");
      }
    }
  }

  fetchRequestData(
    callback: (data?: JSONLikeInterface) => any,
    onError?: (err: Error) => any,
  ) {
    const { url, query, queryString } = HttpClient.parseURL(this.request.url);

    this.url = url;

    this.http = loaders().http.call([
      this.app,
      {
        host: this.app.host,
        uri: this.app.uri,
        query,
        queryString,
        request: this.request,
        response: this.response,
      },
    ]);

    if (this.app.config.get.http.fetchDataOnRequest) {
      ["POST", "PUT", "PATCH"].includes(this.request.method)
        ? this.http.fetchData(callback, onError)
        : callback();
    } else {
      callback();

      if (!HttpHandler.warnings.fetchDataOnRequest) {
        HttpHandler.warnings.fetchDataOnRequest = true;

        console.warn(
          "Auto fetching data on request is disabled in configuration.",
        );
      }
    }
  }

  runHttpService(route: RouteData): false | void {
    if (!route.callback) return false;

    const scope = this.app.factory.service.createServiceScope(this.http, route);

    this.processData(route.callback(scope));
  }

  initController(route: RouteData): false | void {
    const controller =
      loaders().controller.getControllerByRouteDescriptor(
        this.app,
        route,
        this.http,
      ) ||
      // deprecated: loaders().controller.getControllerByRoutePath(this.app, route, this.http);
      loaders().controller.getControllerByRouteEntry(
        this.app,
        route,
        this.http,
      );

    if (!controller) return false;

    const action = this.fetchControllerAction(controller);

    if (!action) HttpClient.throwBadRequest();

    this.processData(controller[CONTROLLER_INITIAL_ACTION]({ action }), () =>
      this.runController(controller, route, action),
    );
  }

  runController(controller: BaseController, route: RouteData, action: string) {
    const args = this.app.router.arrangeRouteParams(route);

    this.processData(controller[action].apply(controller, args));
  }

  fetchControllerAction(controller: BaseController): string {
    const action = controller.route.action?.trim();

    if (!action) {
      return typeof controller[this.http.method] === "function"
        ? this.http.method
        : "";
    }

    const httpAction = `${this.http.method}${$.capitalize(action)}`;

    return typeof controller[httpAction] === "function"
      ? httpAction
      : typeof controller[action] === "function"
      ? action
      : "";
  }

  processData(data: any, callback?: (...args) => any) {
    if (HttpClient.getResponseIsSent(this.response)) return;

    if (data !== undefined) {
      return data instanceof Promise
        ? data
            .then((data) => {
              if (HttpClient.getResponseIsSent(this.response)) return;

              data !== undefined
                ? HttpClient.sendJSON(this.response, data)
                : callback?.();
            })
            .catch((err) =>
              this.app.resolveException(err, this.request, this.response),
            )
        : HttpClient.sendJSON(this.response, data);
    }

    callback?.();
  }
}
