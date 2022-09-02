import {AppLoader} from "../core/app_loader";
import {Controller} from "../core/controller"
import {HttpClient} from "../core/http_client";
import {typeDataRoute} from "../core/router";
import {Service} from "../core/service";

export type typeControllerConstruct = [
    http: HttpClient,
    route: typeDataRoute,
]

export class ControllerLoader extends AppLoader {

    protected _repository = 'controllers'

    protected _pathSuffix = '_controller'

    protected _http: HttpClient

    protected _route: typeDataRoute

    protected _target: Controller

    protected get targetType() {

        return Controller
    }

    protected _onCall(target?: typeof Controller, args?: typeControllerConstruct) {

        if (!target) return

        const [http, route] = args ?? []

        this._route = route

        this._http = http
    }

    protected _resolve(target?: typeof Controller): any {

        if (!target) return

        return this._target = Reflect.construct(target, [this._app, this._http, this._route])
    }

    onGetDependency(target: any): void {

        this.serviceScope = {controller: this._target}

        target instanceof Service && target.setScope(this.serviceScope)
    }

    protected _onGenerate(repository: string): void {
    }

}
