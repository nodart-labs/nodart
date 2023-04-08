"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLineLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const cmd_1 = require("../core/cmd");
class CommandLineLoader extends app_loader_1.AppLoader {
    onGenerate() {
        this._init();
    }
    call(args) {
        return this._init(args === null || args === void 0 ? void 0 : args[0]);
    }
    _init(app) {
        return new cmd_1.CommandLine(app !== null && app !== void 0 ? app : this.app).system.init();
    }
}
exports.CommandLineLoader = CommandLineLoader;
//# sourceMappingURL=cmd_loader.js.map