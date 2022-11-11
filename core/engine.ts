import {EngineClientConfigInterface, EngineInterface} from "./interfaces/engine";

export class Engine implements EngineInterface {

    readonly client = require('nunjucks')

    constructor(readonly config: EngineClientConfigInterface) {

        this.client.configure(config.views, config.options)
    }

    getTemplate(templatePath: string, args?: object, callback?: Function): string {

        return this.client.render(this.normalize(templatePath), args, callback)
    }

    normalize(templatePath: string) {

        templatePath.match(/^(.*?)\.([^.]+)$/i) || (templatePath += '.html')

        return templatePath
    }

}
