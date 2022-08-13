import {Middleware} from "../core/middleware";
import {HttpClient} from "../core/http_client";
import {App} from "../core/app";
import {typeDataRoute} from "../core/router";
import {Controller} from "../core/controller";
import {HttpAcceptorInterface} from "../core/interfaces/http_acceptor_interface";

export declare type typeRouteScope = {
    app?: App,
    http?: HttpClient,
    controller?: Controller,
}

export class Route extends Middleware implements HttpAcceptorInterface {

    constructor(private _data?: typeDataRoute, readonly scope: typeRouteScope = {}) {
        super(scope)
    }

    get data(): typeDataRoute {
        return this._data
    }

    set data(data: typeDataRoute ) {
        this._data = data
    }

    on (action: string, route?: string | object, payload?: () => any): void {
        super.on(action, route, payload)
    }

    expose(rule: string, filter?: Function) {


    }

    delete(...args): any {
    }

    get(...args): any {
    }

    head(...args): any {
    }

    patch(...args): any {
    }

    post(...args): any {
    }

    put(...args): any {
    }

}
