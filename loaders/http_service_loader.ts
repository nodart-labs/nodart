import {AppLoader} from "../core/app_loader";
import {ServiceScope} from "../core/interfaces/service";
import {HttpService} from "../services/http";
import {BaseController} from "../core/controller";
import {RuntimeException} from "../core/exception";
import {object} from "../utils";
import {ControllerLoader} from "./controller_loader";
import {loaders} from "../core/app";
import {Model} from "../core/model";
import {Service} from "../core/service";

export class HttpServiceLoader extends AppLoader {

    call(args: [scope: ServiceScope]): HttpService {

        const scope = args[0] || {}

        if (!scope.app || !scope.http || !scope.route)

            throw new RuntimeException('HttpServiceLoader: Missing required scope properties: app | http | route')

        const http = new HttpService(scope)

        this.intercept(http, scope.app)

        http.setScope({
            model: scope.model ||= (() => http.model),
            service: scope.service ||= (() => http.service),
            controller: scope.controller ||= (() => this.getController(scope)),
            scope
        })

        return http
    }

    getDependency(service: HttpService, property: string, dependency: typeof Model | typeof Service): any {

        switch (property) {
            case 'service':
                return this.resolve(dependency, [{
                    app: service.scope.app,
                    controller: () => service.scope.controller(),
                    model: () => service.scope.model(),
                    service: () => service.scope.service(),
                    http: service.scope.http,
                    route: service.scope.route,
                    scope: service.scope
                }])
            case 'model':
                return loaders().model.call([service.scope.app, dependency as typeof Model])
        }
    }

    getController(scope: ServiceScope, loader?: ControllerLoader): BaseController | void {

        const controller = scope.route.controller?.(scope.route)

        if (controller) {

            if (false === object.isProtoConstructor(controller, BaseController))

                throw `The provided type "${object.getProtoConstructor(controller)?.name}" is not a "Controller".`

            loader ||= scope.app.get('controller')

            return loader.call([scope.app, scope.http, scope.route, controller])
        }
    }

    onCall() {
    }

    onGenerate(repository: string) {
    }

}
