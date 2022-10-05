import {HttpClient} from "./http_client";
import {JSONObjectInterface} from "../interfaces/object";
import {Engine} from "./engine";

export abstract class HttpRespond {

    abstract engine: Engine

    protected constructor(readonly http: HttpClient) {
    }

    get send() {

        return {

            data: (body: JSONObjectInterface | string, status?: number, contentType?: string): void => {

                this.http.send(body, status, contentType)
            },

            view: (template: string, args?: object, status?: number, callback?: Function): void => {

                this.http.sendHtml(this.engine.view(template, args, callback), status)
            }
        }
    }

}
