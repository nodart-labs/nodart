import {typeAppEngineConfig} from "./app_config";

export class Engine {

    readonly client

    constructor(protected _config: typeAppEngineConfig) {
        this.client = require('nunjucks') // See template engine docs: https://mozilla.github.io/nunjucks/api.html
        this.client.configure(_config.views, _config.options)
    }

    view(template: string, args?: object | Function) {
        return this.client.render(this.normalize(template), args)
    }

    normalize(template: string) {
        template.match(/^(.*?)\.([^.]+)$/i) || (template += '.html')
        return template
    }

}
