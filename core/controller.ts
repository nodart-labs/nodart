import {HttpClient} from "./http_client";
import {Strategy} from "./strategy";
import {Middleware} from "./middleware";
import {uses, injects} from "./di";
import {App} from './app'
import {Route} from "../middlewares/route";
import {HttpAcceptorInterface} from "./interfaces/http_acceptor_interface";
import {Session} from "./session";
import {Engine} from "./engine";
import {Model} from "./model";
import {Resource} from "./resource";

type typeDeepNestedGeneric<T> = T | { [key: string]: typeDeepNestedGeneric<T> }

export const CONTROLLER_INITIAL_ACTION = 'init'
export const CONTROLLER_HTTP_ACTIONS = ['get', 'post', 'patch', 'put', 'delete', 'head']

@uses('middleware')
@uses('model')

export abstract class Controller implements HttpAcceptorInterface {

    @injects('middleware') readonly middleware: typeDeepNestedGeneric<Middleware | typeof Middleware>

    @injects('model') readonly model: typeDeepNestedGeneric<Model | typeof Model>

    readonly route: Route

    protected _session: Session

    protected _engine: Engine

    protected constructor(readonly app?: App, readonly http?: HttpClient) {
    }

    abstract init(): any

    abstract get(...args): any

    abstract post(...args): any

    abstract patch(...args): any

    abstract put(...args): any

    abstract delete(...args): any

    abstract head(...args): any

    get session() {
        return this._session ||= <Session>this.app.get('session').call().load(this.http.request, this.http.response)
    }

    get engine() {
        return this._engine ||= <Engine>this.app.get('engine').call()
    }

    get resource() {
        return new Resource(this.http.response)
    }

    get send() {
        return {
            data: (body: object | string, status?: number, contentType?: string) => {
                this.resource.send(body, status, contentType)
            },
            view: (template: string, args?: object, callback?: Function) => {
                this.resource.sendHtml(this.engine.view(template, args, callback))
            }
        }
    }

}
