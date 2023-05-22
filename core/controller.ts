import { App } from "./app";
import { HttpAcceptorInterface } from "./interfaces/http";
import { Service } from "./service";
import { Model } from "./model";
import { injects } from "./di";
import { RouteData } from "./interfaces/router";
import { ObjectDeepNestedGeneric } from "./interfaces/object";
import { HttpContainer } from "./http_client";
import { BaseControllerInterface } from "./interfaces/controller";

export const CONTROLLER_INITIAL_ACTION = "init";

export abstract class BaseController implements BaseControllerInterface {
  abstract readonly service: ObjectDeepNestedGeneric<Service | typeof Service>;

  abstract readonly model: ObjectDeepNestedGeneric<Model | typeof Model>;

  protected constructor(
    readonly app: App,
    readonly http: HttpContainer,
    readonly route: RouteData,
  ) {}

  abstract init(data?: { action: string }): any;

  get session() {
    return this.http.session;
  }

  get send() {
    return this.http.respond;
  }
}

export abstract class Controller
  extends BaseController
  implements HttpAcceptorInterface
{
  @injects("service") readonly service: ObjectDeepNestedGeneric<
    Service | typeof Service
  >;

  @injects("model") readonly model: ObjectDeepNestedGeneric<
    Model | typeof Model
  >;

  abstract get(...args): any;

  abstract post(...args): any;

  abstract patch(...args): any;

  abstract put(...args): any;

  abstract delete(...args): any;
}
