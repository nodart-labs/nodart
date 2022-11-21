import {App} from "../core/app";
import {AppLoader} from "../core/app_loader";
import {BaseController} from "../core/controller"
import {RouteData} from "../core/interfaces/router";
import {HttpContainer} from "../core/http_client";
import {DEFAULT_CONTROLLER_NAME} from "../core/app_config";
import {loaders} from "../core/app";
import {Model} from "../core/model";
import {Service} from "../core/service";
import {object} from "../utils";

export class ControllerLoader extends AppLoader {

    protected _repository = 'controllers'

    protected _pathSuffix = '_controller'

    get sourceType() {

        return BaseController
    }

    call(args: [app: App, http: HttpContainer, route: RouteData, controller?: typeof BaseController]): any {

        const app = args[0] || this.app

        const controller = this.resolve(args[3] || this._source, [app, args[1], args[2]])

        controller && this.intercept(controller, app)

        return controller
    }

    getDependency(controller: BaseController, property: string, dependency: typeof Model | typeof Service): any {

        switch (property) {
            case 'service':
                return this.resolve(dependency, [{
                    app: controller.app,
                    controller: () => controller,
                    model: () => controller.model,
                    service: () => controller.service,
                    http: controller.http,
                    route: controller.route
                }])
            case 'model':
                return loaders().model.call([dependency as typeof Model, controller.app])
        }
    }

    getControllerByRoutePath(app: App, route: RouteData, http: HttpContainer): BaseController | void {

        const data = {path: '', action: ''}
        const rootDir = app.rootDir

        if (route.route) {

            data.path = route.route
            data.action = route.action || ''

        } else {

            data.path = route.pathname || DEFAULT_CONTROLLER_NAME

            if (false === this.isSource(data.path, rootDir)) {

                const path = data.path.split('/')
                const skipAction = path.slice(0, -1).join('/')

                if (this.isSource(skipAction, rootDir)) {

                    data.path = skipAction
                    data.action = path.at(-1)

                } else return
            }
        }

        const controller = this.load(data.path, BaseController, rootDir)

        if (controller) return this.call([app, http, {...route, action: data.action}, controller])
    }

    getControllerByRouteDescriptor(app: App, route: RouteData, http: HttpContainer): BaseController | void {

        const controller = route.controller?.(route)

        if (controller) {

            if (false === object.isProtoConstructor(controller, BaseController))

                throw `Controller loader: The provided type "${object.getProtoConstructor(controller)?.name}" is not a "Controller".`

            return this.call([app, http, route, controller])
        }
    }

    onGenerate(repository: string): void {
    }

}
