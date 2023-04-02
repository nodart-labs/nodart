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
exports.CommandLineParser = exports.CommandLine = exports.SYSTEM_BIN_DIR = exports.SYSTEM_DIR = exports.OPTION_POINTER = void 0;
const utils_1 = require("../utils");
const app_config_1 = require("./app_config");
exports.OPTION_POINTER = '--';
exports.SYSTEM_DIR = utils_1.fs.path(__dirname, '../..');
exports.SYSTEM_BIN_DIR = utils_1.fs.path(exports.SYSTEM_DIR, 'bin');
class CommandLine {
    constructor(app) {
        this.app = app;
        this.parser = new CommandLineParser();
        CommandLine._state = this;
    }
    get command() {
        return this._command || (this._command = CommandLineParser.parseCommand());
    }
    get appCmdDir() {
        return utils_1.fs.formatPath(utils_1.fs.path(process.cwd(), app_config_1.DEFAULT_CMD_DIR));
    }
    get commandsDirectory() {
        return utils_1.fs.path(this.appCmdDir, (this.app.config.get.cli.commandDirName || app_config_1.DEFAULT_CMD_COMMANDS_DIR));
    }
    lock() {
        CommandLine._lock = true;
    }
    unlock() {
        CommandLine._lock = false;
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
    get state() {
        return CommandLine._state;
    }
    get system() {
        return new SystemCommandLine(this);
    }
    run(commandName, directory, onGetExecutor) {
        return __awaiter(this, void 0, void 0, function* () {
            commandName || (commandName = this.command.command);
            if (!commandName || CommandLine._lock)
                return;
            const source = this.getCommandSource(commandName, directory);
            if (!source)
                throw `The "${commandName}" command's source is not found.`;
            const executor = onGetExecutor ? onGetExecutor(source.get()) : source.get();
            if (!executor)
                throw `Cannot find the executor for "${commandName}" command's source.`;
            return yield this.execute(executor).catch((err) => {
                console.error(err);
                process.exit(1);
            });
        });
    }
    execute(executor) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = typeof executor === 'function' ? yield executor({ app: this.app, cmd: this }) : executor;
            if (!(typeof data === 'object'))
                return;
            const { func, values } = yield this.parser.validate(this.command, data).catch(errors => {
                console.log(errors.join("\r\n"));
                process.exit(1);
            });
            return yield Reflect.apply(func, data, values);
        });
    }
}
CommandLine._lock = false;
exports.CommandLine = CommandLine;
class SystemCommandLine {
    constructor(cmd) {
        this.cmd = cmd;
        this._commandsDir = utils_1.fs.path(exports.SYSTEM_BIN_DIR, app_config_1.DEFAULT_CMD_COMMANDS_DIR);
    }
    get commandsDir() {
        return this._commandsDir;
    }
    init() {
        const repo = utils_1.fs.path(this.cmd.app.env.baseDir, app_config_1.DEFAULT_CMD_DIR);
        const cmdDir = utils_1.fs.path(repo, this.cmd.app.config.get.cli.commandDirName || app_config_1.DEFAULT_CMD_COMMANDS_DIR);
        const dest = utils_1.fs.path(repo, 'index.js');
        utils_1.fs.isFile(dest) || utils_1.fs.copy((0, app_config_1.getSourcesDir)(app_config_1.DEFAULT_CMD_DIR + '/index.js'), dest);
        utils_1.fs.isDir(cmdDir) || utils_1.fs.mkDeepDir(cmdDir);
        return this.cmd;
    }
    source(commandName) {
        return this.cmd.getCommandSource(commandName, this.commandsDir);
    }
    commands() {
        return this.cmd.commandList(this.commandsDir);
    }
    run(commandName) {
        return this.cmd.run(commandName, this.commandsDir);
    }
    fetchAppState(app) {
        this.cmd.lock();
        utils_1.fs.include(this.cmd.appCmdDir, { error: () => utils_1.fs.include(utils_1.fs.path(app.builder.buildDir, app_config_1.DEFAULT_CMD_DIR)) });
        Object.assign(app, this.cmd.state.app);
        this.cmd.unlock();
        return this.cmd.state;
    }
    buildApp(app, exitOnError = true) {
        const dist = app.builder.buildDir;
        const rootDir = app.builder.substractRootDir(dist, app.rootDir);
        app.builder.build(() => {
            console.error('The App build directory does not exist.');
            exitOnError && process.exit(1);
        });
        app.config.set({ rootDir: utils_1.fs.isDir(rootDir) ? rootDir : dist });
    }
}
class CommandLineParser {
    static parseCommand() {
        const cmd = {
            command: '',
            action: '',
            options: {},
        };
        const args = process.argv.slice(2);
        args.forEach((arg, i) => {
            var _a, _b;
            if (i === 0) {
                if (arg.startsWith(exports.OPTION_POINTER))
                    return;
                cmd.command = arg;
                args[i + 1] && (((_a = args[i + 1]) === null || _a === void 0 ? void 0 : _a.startsWith(exports.OPTION_POINTER)) || (cmd.action = args[i + 1]));
                return;
            }
            if (arg.startsWith(exports.OPTION_POINTER)) {
                arg = utils_1.$.trim(arg, exports.OPTION_POINTER);
                cmd.options[arg] = (_b = CommandLineParser.assignCommandOptionValues(args, arg, i)) !== null && _b !== void 0 ? _b : true;
            }
        });
        return cmd;
    }
    static assignCommandOptionValues(args, arg, index) {
        const values = {};
        for (let i = index; i < args.length; i++) {
            let value = args[i + 1];
            if (value === undefined || value.startsWith(exports.OPTION_POINTER))
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
    parseAction(command, executorData) {
        const action = utils_1.$.hyphen2Camel(command.action);
        const actionFunc = action && typeof (executorData === null || executorData === void 0 ? void 0 : executorData[action]) === 'function' ? executorData[action] : null;
        if (!actionFunc)
            return;
        const options = command.options;
        const args = {};
        const argsData = utils_1.object.arrangeFuncArguments(actionFunc);
        Object.keys(options).forEach(k => args[utils_1.$.hyphen2Camel(k)] = options[k]);
        return {
            action,
            func: actionFunc,
            executor: executorData,
            args,
            argsData,
            values: argsData.map(a => a.arg in args ? args[a.arg] : undefined)
        };
    }
    validate(command, executorData) {
        const actionData = (this.parseAction(command, executorData) || {});
        return new Promise((resolve, reject) => {
            const errors = [];
            const actions = Object.keys(executorData);
            if (!actionData.action && !command.action) {
                actions.length && errors.push(`No action supplied for command "${command.command} ${command.action}". (${actions.join('|')})`);
                return actions.length ? reject(errors) : resolve(actionData);
            }
            if (typeof executorData[actionData.action] === 'function') {
                const { missing } = this.actionArgumentsValidate(actionData);
                missing.length && errors.push(`Missing required arguments: ${missing.map(v => exports.OPTION_POINTER + v).join(', ')}.`);
            }
            else
                errors.push(`The action "${command.action}" does not exist in command "${command.command}". (${actions.join('|')})`);
            errors.length ? reject(errors) : resolve(actionData);
        });
    }
    actionArgumentsValidate(actionData) {
        const missing = [];
        actionData.argsData.forEach(({ arg, type, required }, index) => {
            const val = actionData.values[index];
            required && val === undefined && missing.push(arg);
            if (val === undefined)
                return;
            type === 'number' && (actionData.values[index] = !isNaN(parseFloat(val)) ? parseFloat(val) : 0);
            type === 'boolean' && (actionData.values[index] = Boolean(val));
            type === 'array' && !Array.isArray(val) && (actionData.values[index] = [val]);
            type === 'object' && utils_1.$.isEmpty(val) && (actionData.values[index] = {});
            type === 'string' && typeof val !== 'string' && (actionData.values[index] = val.toString());
        });
        return { missing };
    }
}
exports.CommandLineParser = CommandLineParser;
//# sourceMappingURL=cmd.js.map