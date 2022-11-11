"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const model_1 = require("../core/model");
class ModelLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'models';
    }
    get sourceType() {
        return model_1.Model;
    }
    call(args, path, rootDir) {
        let [app, type] = args || [];
        type || (type = this._source);
        app || (app = this.app);
        const model = this.resolve(path ? this.load(path, model_1.Model, rootDir) : type, args);
        if (model) {
            model.orm || (model.orm = app.get('orm').call());
            model.queryBuilder || (model.queryBuilder = model.orm.queryBuilder);
        }
        return model;
    }
    onCall(target) {
    }
    onGenerate(repository) {
    }
}
exports.ModelLoader = ModelLoader;
//# sourceMappingURL=model_loader.js.map