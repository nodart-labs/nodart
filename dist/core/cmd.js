"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLine = void 0;
const utils_1 = require("../utils");
const app_config_1 = require("./app_config");
const OPTION_POINTER = '--';
class CommandLine {
    constructor(app) {
        this.app = app;
    }
    static parseCommand() {
        const cmd = {
            command: '',
            action: '',
            options: {}
        };
        const args = process.argv.slice(2);
        args.forEach((arg, i) => {
            var _a, _b;
            if (i === 0) {
                if (arg.startsWith(OPTION_POINTER))
                    return;
                cmd.command = arg;
                args[i + 1] && (((_a = args[i + 1]) === null || _a === void 0 ? void 0 : _a.startsWith(OPTION_POINTER)) || (cmd.action = args[i + 1]));
                return;
            }
            if (arg.startsWith(OPTION_POINTER)) {
                arg = utils_1.$.trim(arg, OPTION_POINTER);
                cmd.options[arg] = (_b = CommandLine.assignCommandOptionValues(args, arg, i)) !== null && _b !== void 0 ? _b : true;
            }
        });
        return cmd;
    }
    static assignCommandOptionValues(args, arg, index) {
        const values = {};
        for (let i = index; i < args.length; i++) {
            let value = args[i + 1];
            if (value === undefined || value.startsWith(OPTION_POINTER))
                return values[arg];
            value === 'true'
                ? value = true : value === 'false'
                ? value = false : !isNaN(parseFloat(value)) && (value = parseFloat(value));
            i > index
                ? (Array.isArray(values[arg]) ? values[arg].push(value) : values[arg] = [values[arg], value])
                : values[arg] = value;
        }
        return values[arg];
    }
    get command() {
        return this._command || (this._command = CommandLine.parseCommand());
    }
    get commandsDirectory() {
        return utils_1.fs.formatPath(this.app.rootDir
            + '/' + app_config_1.DEFAULT_CMD_DIR
            + '/' + (this.app.config.get.cli.commandDirName || app_config_1.DEFAULT_CMD_COMMANDS_DIR));
    }
    commandList(directory) {
        directory || (directory = this.commandsDirectory);
        const commands = [];
        utils_1.fs.dir(directory).forEach((file) => {
            const command = this.getCommandSourceName(file, directory);
            commands.push({ command, file });
        });
        return commands;
    }
    getCommandSourceName(file, directory) {
        directory = utils_1.fs.formatPath(directory);
        const source = utils_1.fs.parseFile(file);
        const sourceDir = utils_1.fs.formatPath(source.dir);
        const path = utils_1.fs.formatPath(sourceDir.replace(directory, ''));
        return path ? path + '/' + source.name : source.name;
    }
    getCommandSource(name, directory) {
        for (const { file, command } of this.commandList(directory)) {
            if (command === name)
                return {
                    command,
                    file,
                    get: () => utils_1.fs.include(file)
                };
        }
    }
    get system() {
        const dir = require('path').resolve(__dirname, '../../bin/' + app_config_1.DEFAULT_CMD_COMMANDS_DIR);
        return {
            directory: dir,
            source: (commandName) => this.getCommandSource(commandName, dir),
            commands: () => this.commandList(dir),
            run: (commandName) => this.run(commandName, dir)
        };
    }
    run(commandName, directory) {
        return __awaiter(this, void 0, void 0, function* () {
            commandName || (commandName = this.command.command);
            if (!commandName)
                return;
            const source = this.getCommandSource(commandName, directory);
            if (!source)
                throw `The "${commandName}" command's source is not found.`;
            const executor = source.get();
            if (!executor)
                throw `Cannot find the executor for "${commandName}" command's source.`;
            return yield this.execute(executor);
        });
    }
    execute(executor) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = executor instanceof Function ? yield executor({ app: this.app, cmd: this }) : executor;
            if (!(data instanceof Object))
                return;
            const command = utils_1.$.hyphen2Camel(this.command.action);
            const action = command && data[command] instanceof Function ? data[command] : null;
            if (!action)
                return;
            const options = this.command.options;
            const args = {};
            Object.keys(options).forEach(k => args[utils_1.$.hyphen2Camel(k)] = options[k]);
            const values = utils_1.object.arrangeFuncArguments(action).map(a => a.arg in args ? args[a.arg] : undefined);
            return yield Reflect.apply(action, data, values);
        });
    }
}
exports.CommandLine = CommandLine;
//# sourceMappingURL=cmd.js.map