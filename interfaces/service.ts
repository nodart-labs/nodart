import {App} from "../core/app";
import {HttpClient} from "../core/http_client";
import {RouteData, RouteDescriptor} from "./router";
import {HttpRespond} from "../core/http_respond";
import {Session} from "../core/session";
import {Controller} from "../core/controller";

export type ServiceScope = {
    app?: App
    http?: HttpClient
    route?: RouteData
    session?: Session
    controller?: Controller
    model?: any
    service?: any
    [addon: string]: any
}

export type HttpServiceScope = ServiceScope & {
    respond?: HttpRespond
}

export type HttpServiceRouteCallback = (scope: HttpServiceScope) => Promise<any> | any

export type HttpServiceRouteObject = {
    route: string | RouteDescriptor
    action: string
    callback: HttpServiceRouteCallback
}

export type HttpServiceSubscriber = (data: HttpServiceRouteObject) => void
