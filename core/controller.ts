import {App} from './app'
import {HttpClient} from "./http_client";
import {HttpAcceptorInterface} from "./interfaces/http_acceptor_interface";
import {Service} from "./service";
import {Session} from "./session";
import {Engine} from "./engine";
import {Model} from "./model";
import {uses, injects} from "./di";
import {typeDataRoute} from "./router";

type typeDeepNestedGeneric<T> = { [key: string]: typeDeepNestedGeneric<T> } | T

export const CONTROLLER_INITIAL_ACTION = 'init'
export const CONTROLLER_HTTP_ACTIONS = ['get', 'post', 'patch', 'put', 'delete', 'head']

@uses('service')
@uses('model')

export abstract class Controller implements HttpAcceptorInterface {

    @injects('service') readonly service: typeDeepNestedGeneric<Service | typeof Service>

    @injects('model') readonly model: typeDeepNestedGeneric<Model | typeof Model>

    protected _session: Session

    protected _engine: Engine

    protected constructor(readonly app?: App, readonly http?: HttpClient, readonly route?: typeDataRoute) {
    }

    abstract init(): any

    abstract get(...args): any

    abstract post(...args): any

    abstract patch(...args): any

    abstract put(...args): any

    abstract delete(...args): any

    abstract head(...args): any

    get session() {
        return this._session ||= <Session>this.app.get('session').call().load(this.http)
    }

    get engine() {
        return this._engine ||= <Engine>this.app.get('engine').call()
    }

    get send() {
        return {
            data: (body: object | string, status?: number, contentType?: string) => {
                this.http.send(body, status, contentType)
            },
            view: (template: string, args?: object, status?: number, callback?: Function) => {
                this.http.sendHtml(this.engine.view(template, args, callback), status)
            }
        }
    }

}
