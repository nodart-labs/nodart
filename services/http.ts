import {HttpAcceptorInterface, HttpURL} from "../interfaces/http";
import {
    HttpServiceScope,
    HttpServiceSubscriber,
    HttpServiceRouteCallback,
    HttpServiceRouteObject
} from "../interfaces/service";
import {RouteData, RouteDescriptor} from "../interfaces/router";
import {Service} from "../core/service";
import {injects, uses} from "../core/di";
import {ObjectDeepNestedGeneric} from "../interfaces/object";
import {Model} from "../core/model";
import {Router} from "../core/router";
import {HttpServiceLoader} from "../loaders/http_service_loader";
import {$} from "../utils";

@uses('service')
@uses('model')

export class HttpService extends Service {

    @injects('service') readonly service: ObjectDeepNestedGeneric<Service | typeof Service>

    @injects('model') readonly model: ObjectDeepNestedGeneric<Model | typeof Model>

    readonly subscribers: HttpServiceSubscriber[] = []

    constructor(scope: HttpServiceScope) {

        super(scope)

        this.setScope(scope)
    }

    setScope(scope: HttpServiceScope) {

        scope.model = this.model

        scope.service = this.service

        super.setScope(scope)
    }

    get scope(): HttpServiceScope {

        return this._scope
    }

    sendRoute(route: string | RouteDescriptor, action: string, callback: HttpServiceRouteCallback) {

        this.subscribers.forEach(cb => cb({route, action, callback}))
    }

    subscribe(subscriber: HttpServiceSubscriber) {

        this.subscribers.push(subscriber)
    }

    get httpAcceptor(): HttpServiceAcceptor {

        return new HttpServiceAcceptor(this)
    }

}

export const HTTP_SERVICE_ACCEPTOR_COMMON_ACTION = 'any'

export class HttpServiceAcceptor implements HttpAcceptorInterface {

    constructor(protected _httpService: HttpService) {
    }

    any(route: string | RouteDescriptor, callback: HttpServiceRouteCallback) {

        this._httpService.sendRoute(route, 'any', callback)
    }

    get(route: string | RouteDescriptor, callback: HttpServiceRouteCallback) {

        this._httpService.sendRoute(route, 'get', callback)
    }

    head(route: string | RouteDescriptor, callback: HttpServiceRouteCallback) {

        this._httpService.sendRoute(route, 'head', callback)
    }

    patch(route: string | RouteDescriptor, callback: HttpServiceRouteCallback) {

        this._httpService.sendRoute(route, 'patch', callback)
    }

    post(route: string | RouteDescriptor, callback: HttpServiceRouteCallback) {

        this._httpService.sendRoute(route, 'post', callback)
    }

    put(route: string | RouteDescriptor, callback: HttpServiceRouteCallback) {

        this._httpService.sendRoute(route, 'put', callback)
    }

    delete(route: string | RouteDescriptor, callback: HttpServiceRouteCallback) {

        this._httpService.sendRoute(route, 'delete', callback)
    }

}

export class HttpServiceHandler {

    constructor(readonly router: Router, readonly routes: Array<HttpServiceRouteObject>) {
    }

    getRouteData(filter: (route: HttpServiceRouteObject) => boolean, url: HttpURL): RouteData | void {

        const routes = this.routes.filter(route => filter(route)).map(r => {

            const route = r.route instanceof Object ? r.route : {path: r.route}

            route.action = r.action

            route.callback = r.callback

            return route
        })

        return this.router.findRoute(routes, url)
    }

    findRouteByRouteData(data: RouteData): HttpServiceRouteObject | void {

        return this.routes.find(r => {

            const path = $.trimPath(typeof r.route === 'string' ? r.route : r.route.path)

            return path === data.path && r.action === data.action
        })
    }

    async runService(route: HttpServiceRouteObject, scope: HttpServiceScope, loader: HttpServiceLoader): Promise<any> {

        const httpService = loader.call([scope]) as HttpService

        const data = await route.callback(httpService.scope)

        if (httpService.scope.http?.responseIsSent) return

        if ($.isPlainObject(data) || typeof data === 'string') httpService.scope.respond?.send.data(data)

        return data
    }

}
