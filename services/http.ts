import {HttpAcceptorInterface} from "../core/interfaces/http";
import {ServiceScope, HttpServiceSubscriber, HttpServiceCallback} from "../core/interfaces/service";
import {RouteDescriptor} from "../core/interfaces/router";
import {Service} from "../core/service";
import {injects} from "../core/di";
import {ObjectDeepNestedGeneric} from "../core/interfaces/object";
import {Model} from "../core/model";

export class HttpService extends Service {

    @injects('service') service: ObjectDeepNestedGeneric<Service | typeof Service>

    @injects('model') model: ObjectDeepNestedGeneric<Model | typeof Model>

    readonly subscribers: HttpServiceSubscriber[] = []

    constructor(scope: ServiceScope = {}) {

        super(scope)
    }

    sendRoute(route: string | RouteDescriptor, action: string, callback: HttpServiceCallback) {

        route = typeof route === 'string' ? {path: route} : route

        this.subscribers.forEach(listen => listen({route, action, callback}))
    }

    subscribe(subscriber: HttpServiceSubscriber) {

        this.subscribers.push(subscriber)
    }

    get httpAcceptor(): HttpServiceAcceptor {

        return new HttpServiceAcceptor(this)
    }

}

export class HttpServiceAcceptor implements HttpAcceptorInterface {

    constructor(protected _httpService: HttpService) {
    }

    any(route: string | RouteDescriptor, callback: HttpServiceCallback) {

        this._httpService.sendRoute(route, 'any', callback)
    }

    get(route: string | RouteDescriptor, callback: HttpServiceCallback) {

        this._httpService.sendRoute(route, 'get', callback)
    }

    head(route: string | RouteDescriptor, callback: HttpServiceCallback) {

        this._httpService.sendRoute(route, 'head', callback)
    }

    patch(route: string | RouteDescriptor, callback: HttpServiceCallback) {

        this._httpService.sendRoute(route, 'patch', callback)
    }

    post(route: string | RouteDescriptor, callback: HttpServiceCallback) {

        this._httpService.sendRoute(route, 'post', callback)
    }

    put(route: string | RouteDescriptor, callback: HttpServiceCallback) {

        this._httpService.sendRoute(route, 'put', callback)
    }

    delete(route: string | RouteDescriptor, callback: HttpServiceCallback) {

        this._httpService.sendRoute(route, 'delete', callback)
    }
}
