import {AppLoader} from "../core/app_loader";
import {Controller} from "../core/controller"
import {HttpClient} from "../core/http_client";
import {RouteData} from "../interfaces/router";

export class ControllerLoader extends AppLoader {

    protected _repository = 'controllers'

    protected _pathSuffix = '_controller'

    protected _http: HttpClient

    protected _route: RouteData

    protected _target: Controller

    protected get targetType() {

        return Controller
    }

    protected _onCall(target?: typeof Controller, args?: [http: HttpClient, route: RouteData]) {

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

        super.onGetDependency(target)
    }

    protected _onGenerate(repository: string): void {
    }

}
