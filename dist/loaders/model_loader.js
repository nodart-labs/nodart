"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const model_1 = require("../core/model");
class ModelLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = "models";
    }
    get sourceType() {
        return model_1.Model;
    }
    call(args, path, rootDir) {
        let [type, app] = args || [];
        type || (type = this._source);
        app || (app = this.app);
        const model = this.resolve(path ? this.load(path, model_1.Model, rootDir) : type, args);
        if (model) {
            model.orm || (model.orm = app.service.db.orm);
            model.queryBuilder || (model.queryBuilder = model.orm.queryBuilder);
        }
        return model;
    }
    onGenerate() { }
}
exports.ModelLoader = ModelLoader;
//# sourceMappingURL=model_loader.js.map