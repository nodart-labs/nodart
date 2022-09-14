import {App} from "../core/app";
import {Controller} from "../core/controller";

export type ServiceScope = {
    app?: App,
    controller?: Controller,
    [key: string]: any
}
