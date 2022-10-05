import {AppLoader} from "../core/app_loader";
import {Controller} from "../core/controller"
import {HttpClient} from "../core/http_client";
import {RouteData} from "../interfaces/router";
import {Service} from "../core/service";

export class ControllerLoader extends AppLoader {

    protected _repository = 'controllers'

    protected _pathSuffix = '_controller'

    protected _http: HttpClient

    protected _route: RouteData

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

        if (target instanceof Service && this._pushDependency(target) && this._target instanceof Controller) {

            const controller = this._target

            this.serviceScope = {
                controller,
                model: controller.model,
                service: controller.service,
                http: controller.http,
                route: controller.route,
                session: controller.session
            }
        }

        super.onGetDependency(target)
    }

    protected _onGenerate(repository: string): void {
    }

}
