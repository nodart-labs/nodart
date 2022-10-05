import {App} from './app'
import {HttpClient} from "./http_client";
import {HttpAcceptorInterface} from "../interfaces/http";
import {Service} from "./service";
import {Session} from "./session";
import {Engine} from "./engine";
import {Model} from "./model";
import {uses, injects} from "./di";
import {RouteData} from "../interfaces/router";
import {ObjectDeepNestedGeneric} from "../interfaces/object";
import {HttpRespond} from "./http_respond";

export const CONTROLLER_INITIAL_ACTION = 'init'
export const CONTROLLER_HTTP_ACTIONS = ['get', 'post', 'patch', 'put', 'delete', 'head']

@uses('service')
@uses('model')

export abstract class Controller extends HttpRespond implements HttpAcceptorInterface {

    @injects('service') readonly service: ObjectDeepNestedGeneric<Service | typeof Service>

    @injects('model') readonly model: ObjectDeepNestedGeneric<Model | typeof Model>

    protected _session: Session

    protected _engine: Engine

    protected constructor(
        readonly app: App,
        readonly http: HttpClient,
        readonly route: RouteData) {

        super(http)
    }

    abstract init(): void

    abstract get(...args): any

    abstract post(...args): any

    abstract patch(...args): any

    abstract put(...args): any

    abstract delete(...args): any

    abstract head(...args): any

    get session() {
        return this._session ||= <Session>this.app.get('session').call([this.http])
    }

    get engine() {
        return this._engine ||= <Engine>this.app.get('engine').call()
    }

}
