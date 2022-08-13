import {HttpClient} from "./http_client";
import {Strategy} from "./strategy";
import {Middleware} from "./middleware";
import {uses, injects} from "./di";
import {App} from './app'
import {Entity} from "./entity";
import {Route} from "../middlewares/route";
import {HttpAcceptorInterface} from "./interfaces/http_acceptor_interface";

type typeDeepNestedGeneric<T> = T | { [key: string]: typeDeepNestedGeneric<T> }

export const CONTROLLER_INITIAL_ACTION = 'init'
export const CONTROLLER_HTTP_ACTIONS = ['get', 'post', 'patch', 'put', 'delete', 'head']

@uses('middleware')
@uses('strategy')
@uses('entity')
@uses('engine')

export abstract class Controller implements HttpAcceptorInterface {

    @injects('entity') readonly entity: typeDeepNestedGeneric<Entity | typeof Entity>

    @injects('middleware') readonly middleware: typeDeepNestedGeneric<Middleware | typeof Middleware>

    @injects('strategy') readonly strategy: typeDeepNestedGeneric<Strategy | typeof Strategy>

    @injects('engine') readonly engine

    readonly route: Route

    protected constructor(readonly app?: App, readonly http?: HttpClient) {
    }

    abstract init(): any

    abstract get(...args): any

    abstract post(...args): any

    abstract patch(...args): any

    abstract put(...args): any

    abstract delete(...args): any

    abstract head(...args): any

}
