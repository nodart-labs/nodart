import {AppLoader} from "../core/app_loader";
import {Engine} from "../core/engine";
import {HttpResponseDataInterface} from "../interfaces/http";

export class ExceptionTemplateLoader extends AppLoader {

    getTemplate(response: HttpResponseDataInterface) {

        const template = this._app.config.get.exception.template

        return template instanceof Function ? template(response) : template
    }

    protected _onCall(target: any, args?: any[]) {
    }

    protected _resolve(target?: any, args?: [response: HttpResponseDataInterface]): any {

        const template = this.getTemplate(args[0])
        const engineLoader = this._app.get('engine')
        const engine = engineLoader.call() as Engine

        if (!template || !engineLoader?.isFile(engine?.normalize(template))) return

        return engine.view(template, {response: args[0] ?? {}})
    }

    protected _onGenerate(repository: string) {
    }

}
