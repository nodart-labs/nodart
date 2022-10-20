"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLineLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const cmd_1 = require("../core/cmd");
class CommandLineLoader extends app_loader_1.AppLoader {
    _onCall(target, args) {
    }
    _onGenerate(repository) {
        this._init();
    }
    _resolve(target, args) {
        return this._init();
    }
    _init(app) {
        return new cmd_1.CommandLine(app !== null && app !== void 0 ? app : this._app).system.init();
    }
}
exports.CommandLineLoader = CommandLineLoader;
//# sourceMappingURL=cmd_loader.js.map