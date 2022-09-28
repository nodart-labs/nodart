"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLineLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const cmd_1 = require("../core/cmd");
const app_config_1 = require("../core/app_config");
const utils_1 = require("../utils");
class CommandLineLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = app_config_1.DEFAULT_CMD_DIR;
    }
    _onCall(target, args) {
    }
    _onGenerate(repository) {
        const cmdDir = utils_1.fs.path(repository, this._app.config.get.cli.commandDirName || app_config_1.DEFAULT_CMD_COMMANDS_DIR);
        this._loadSource();
        utils_1.fs.isDir(cmdDir) || utils_1.fs.mkDeepDir(cmdDir);
    }
    _resolve(target, args) {
        var _a;
        this._loadSource();
        return new cmd_1.CommandLine((_a = args === null || args === void 0 ? void 0 : args[0]) !== null && _a !== void 0 ? _a : this._app);
    }
    _loadSource() {
        const dest = this.getRepo() + '/index.js';
        utils_1.fs.isFile(dest) || utils_1.fs.copy((0, app_config_1.getSourcesDir)('cmd/index.js'), dest);
    }
}
exports.CommandLineLoader = CommandLineLoader;
//# sourceMappingURL=cmd_loader.js.map