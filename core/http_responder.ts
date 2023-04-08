import { JSONObjectInterface } from "./interfaces/object";
import { EngineInterface } from "./interfaces/engine";
import {
  HttpContainerInterface,
  HttpResponderInterface,
} from "./interfaces/http";

export class HttpResponder implements HttpResponderInterface {
  constructor(
    readonly http: HttpContainerInterface,
    readonly engine: EngineInterface,
  ) {}

  data(
    body: JSONObjectInterface | string,
    status?: number,
    contentType?: string,
  ): void {
    this.http.send(body, status, contentType);
  }

  view(
    template: string,
    assign?: object,
    status?: number,
    callback?: (...args) => any,
  ): void {
    this.http.sendHtml(
      this.engine.getTemplate(template, assign, callback),
      status,
    );
  }
}
