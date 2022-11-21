import {AppLoader} from "../core/app_loader";
import {HttpResponseDataInterface} from "../core/interfaces/http";

export class ExceptionTemplateLoader extends AppLoader {

    getTemplate(response: HttpResponseDataInterface) {

        const template = this.app.config.get.exception?.template

        return typeof template === 'function' ? template(response) : template
    }

    call(args: [response: HttpResponseDataInterface]): string | void {

        const template = this.getTemplate(args[0])
        const engineLoader = this.app.get('engine')
        const engine = engineLoader.call()

        if (!template || !engineLoader.isFile(engine.normalize(template))) return

        return engine.getTemplate(template, {response: args[0]})
    }

    onGenerate(repository: string) {
    }

}
