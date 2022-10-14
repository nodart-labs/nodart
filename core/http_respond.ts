import {HttpClient} from "./http_client";
import {JSONObjectInterface} from "../interfaces/object";
import {Engine} from "./engine";
import {EngineInterface} from "../interfaces/engine";
import {HttpResponderInterface} from "../interfaces/http";

export abstract class HttpRespond {

    abstract engine: Engine | EngineInterface

    abstract httpResponder: HttpResponder | HttpResponderInterface

    protected constructor(readonly http: HttpClient) {
    }

    get send() {

        return this.httpResponder
    }
}

export class HttpResponder implements HttpResponderInterface {

    constructor(readonly respond: HttpRespond) {
    }

    data(body: JSONObjectInterface | string, status?: number, contentType?: string): void {

        this.respond.http.send(body, status, contentType)
    }

    view(template: string, assign?: object, status?: number, callback?: Function): void {

        this.respond.http.sendHtml(this.respond.engine.getTemplate(template, assign, callback), status)
    }
}
