import {EngineConfigInterface} from "../interfaces/engine";

export class Engine {

    readonly client = require('nunjucks')

    constructor(readonly config: EngineConfigInterface) {

        this.client.configure(config.views, config.options)
    }

    view(templatePath: string, args?: object, callback?: Function) {

        return this.client.render(this.normalize(templatePath), args, callback)
    }

    normalize(templatePath: string) {

        templatePath.match(/^(.*?)\.([^.]+)$/i) || (templatePath += '.html')

        return templatePath
    }

}
