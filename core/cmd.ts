import { $, fs, object } from "../utils";
import { App } from "./app";
import {
  DEFAULT_CMD_COMMANDS_DIR,
  DEFAULT_CMD_DIR,
  getSourcesDir,
} from "./app_config";
import {
  Command,
  CommandExecutor,
  CommandList,
  CommandSource,
} from "./interfaces/cmd";
import { FunctionArgumentParseData } from "./interfaces/object";

export const OPTION_POINTER = "--";
export const SYSTEM_DIR = fs.path(__dirname, "../..");
export const SYSTEM_BIN_DIR = fs.path(SYSTEM_DIR, "bin");

type ActionParseData = {
  action: string;
  func: (...args) => any;
  args: { [key: string]: any };
  executor: { [key: string]: any };
  argsData: Array<FunctionArgumentParseData>;
  values: any[];
};

export class CommandLine {
  protected _command: Command;

  protected static _lock = false;

  protected static _state: CommandLine;

  readonly parser: CommandLineParser;

  constructor(readonly app: App) {
    this.parser = new CommandLineParser();

    CommandLine._state = this;
  }

  get command(): Command {
    return (this._command ||= CommandLineParser.parseCommand());
  }

  get appCmdDir() {
    return fs.formatPath(fs.path(process.cwd(), DEFAULT_CMD_DIR));
  }

  get commandsDirectory() {
    return fs.path(
      this.appCmdDir,
      this.app.config.get.cli.commandDirName || DEFAULT_CMD_COMMANDS_DIR,
    );
  }

  lock() {
    CommandLine._lock = true;
  }

  unlock() {
    CommandLine._lock = false;
  }

  commandList(directory?: string): CommandList {
    directory ||= this.commandsDirectory;
    const commands = [];

    fs.dir(directory).forEach((file) => {
      const command = this.getCommandSourceName(file, directory);

      commands.push({ command, file });
    });

    return commands;
  }

  getCommandSourceName(file: string, directory: string) {
    directory = fs.formatPath(directory);

    const source = fs.parseFile(file);
    const sourceDir = fs.formatPath(source.dir);
    const path = fs.formatPath(sourceDir.replace(directory, ""));

    return path ? path + "/" + source.name : source.name;
  }

  getCommandSource(name: string, directory?: string): CommandSource | void {
    for (const { file, command } of this.commandList(directory)) {
      if (command === name)
        return {
          command,
          file,
          get: () => fs.include(file),
        };
    }
  }

  get state(): CommandLine {
    return CommandLine._state;
  }

  get system() {
    return new SystemCommandLine(this);
  }

  async run(
    commandName?: string,
    directory?: string,
    onGetExecutor?: (executor: CommandExecutor) => CommandExecutor,
  ) {
    commandName ||= this.command.command;

    if (!commandName || CommandLine._lock) return;

    const source = this.getCommandSource(commandName, directory);

    if (!source) throw `The "${commandName}" command's source is not found.`;

    const executor = onGetExecutor ? onGetExecutor(source.get()) : source.get();

    if (!executor)
      throw `Cannot find the executor for "${commandName}" command's source.`;

    return await this.execute(executor).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }

  async execute(executor: CommandExecutor) {
    const data =
      typeof executor === "function"
        ? await executor({ app: this.app, cmd: this })
        : executor;

    if (!(typeof data === "object")) return;

    const { func, values } = (await this.parser
      .validate(this.command, data)
      .catch((errors) => {
        console.log(errors.join("\r\n"));
        process.exit(1);
      })) as ActionParseData;

    return await Reflect.apply(func, data, values);
  }
}

class SystemCommandLine {
  protected _commandsDir: string;

  constructor(readonly cmd: CommandLine) {
    this._commandsDir = fs.path(SYSTEM_BIN_DIR, DEFAULT_CMD_COMMANDS_DIR);
  }

  get commandsDir() {
    return this._commandsDir;
  }

  init() {
    const repo = fs.path(this.cmd.app.env.baseDir, DEFAULT_CMD_DIR);

    const cmdDir = fs.path(
      repo,
      this.cmd.app.config.get.cli.commandDirName || DEFAULT_CMD_COMMANDS_DIR,
    );

    const dest = fs.path(repo, "index.js");

    fs.isFile(dest) ||
      fs.copy(getSourcesDir(DEFAULT_CMD_DIR + "/index.js"), dest);

    fs.isDir(cmdDir) || fs.mkDeepDir(cmdDir);

    return this.cmd;
  }

  source(commandName?: string) {
    return this.cmd.getCommandSource(commandName, this.commandsDir);
  }

  commands() {
    return this.cmd.commandList(this.commandsDir);
  }

  run(commandName?: string) {
    return this.cmd.run(commandName, this.commandsDir);
  }

  fetchAppState(app: App) {
    this.cmd.lock();

    fs.include(this.cmd.appCmdDir, {
      error: () => fs.include(fs.path(app.builder.buildDir, DEFAULT_CMD_DIR)),
    });

    Object.assign(app, this.cmd.state.app);

    this.cmd.unlock();

    return this.cmd.state;
  }

  buildApp(app: App, exitOnError = true) {
    const dist = app.builder.buildDir;

    const rootDir = app.builder.substractRootDir(dist, app.rootDir);

    app.builder.build(() => {
      console.error("The App build directory does not exist.");

      exitOnError && process.exit(1);
    });

    app.config.set({ rootDir: fs.isDir(rootDir) ? rootDir : dist });
  }
}

export class CommandLineParser {
  static parseCommand(): Command {
    const cmd: Command = {
      command: "",
      action: "",
      options: {},
    };

    const args = process.argv.slice(2);

    args.forEach((arg, i) => {
      if (i === 0) {
        if (arg.startsWith(OPTION_POINTER)) return;
        cmd.command = arg;

        args[i + 1] &&
          (args[i + 1]?.startsWith(OPTION_POINTER) ||
            (cmd.action = args[i + 1]));

        return;
      }

      if (arg.startsWith(OPTION_POINTER)) {
        arg = $.trim(arg, OPTION_POINTER);

        cmd.options[arg] =
          CommandLineParser.assignCommandOptionValues(args, arg, i) ?? true;
      }
    });

    return cmd;
  }

  static assignCommandOptionValues(args: string[], arg: string, index: number) {
    const values = {};

    for (let i = index; i < args.length; i++) {
      let value: any = args[i + 1];

      if (value === undefined || value.startsWith(OPTION_POINTER))
        return values[arg];

      value === "true"
        ? (value = true)
        : value === "false"
        ? (value = false)
        : !isNaN(parseFloat(value)) && (value = parseFloat(value));

      i > index
        ? Array.isArray(values[arg])
          ? values[arg].push(value)
          : (values[arg] = [values[arg], value])
        : (values[arg] = value);
    }

    return values[arg];
  }

  parseAction(
    command: Command,
    executorData?: { [key: string]: any },
  ): void | ActionParseData {
    const action = $.hyphen2Camel(command.action);
    const actionFunc =
      action && typeof executorData?.[action] === "function"
        ? executorData[action]
        : null;

    if (!actionFunc) return;

    const options = command.options;
    const args = {};
    const argsData = object.arrangeFuncArguments(actionFunc);

    Object.keys(options).forEach((k) => (args[$.hyphen2Camel(k)] = options[k]));

    return {
      action,
      func: actionFunc,
      executor: executorData,
      args,
      argsData,
      values: argsData.map((a) => (a.arg in args ? args[a.arg] : undefined)),
    };
  }

  validate(
    command: Command,
    executorData: { [key: string]: any },
  ): Promise<ActionParseData> {
    const actionData = (this.parseAction(command, executorData) ||
      {}) as ActionParseData;

    return new Promise((resolve, reject) => {
      const errors = [];
      const actions = Object.keys(executorData);

      if (!actionData.action && !command.action) {
        actions.length &&
          errors.push(
            `No action supplied for command "${command.command} ${
              command.action
            }". (${actions.join("|")})`,
          );

        return actions.length ? reject(errors) : resolve(actionData);
      }

      if (typeof executorData[actionData.action] === "function") {
        const { missing } = this.actionArgumentsValidate(actionData);

        missing.length &&
          errors.push(
            `Missing required arguments: ${missing
              .map((v) => OPTION_POINTER + v)
              .join(", ")}.`,
          );
      } else
        errors.push(
          `The action "${command.action}" does not exist in command "${
            command.command
          }". (${actions.join("|")})`,
        );

      errors.length ? reject(errors) : resolve(actionData);
    });
  }

  actionArgumentsValidate(actionData: ActionParseData) {
    const missing = [];

    actionData.argsData.forEach(({ arg, type, required }, index) => {
      const val = actionData.values[index];

      required && val === undefined && missing.push(arg);

      if (val === undefined) return;

      type === "number" &&
        (actionData.values[index] = !isNaN(parseFloat(val))
          ? parseFloat(val)
          : 0);
      type === "boolean" && (actionData.values[index] = Boolean(val));

      type === "array" &&
        !Array.isArray(val) &&
        (actionData.values[index] = [val]);
      type === "object" && $.isEmpty(val) && (actionData.values[index] = {});

      type === "string" &&
        typeof val !== "string" &&
        (actionData.values[index] = val.toString());
    });

    return { missing };
  }
}
