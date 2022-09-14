import {App} from "./app";
import {$, fs, object} from "../utils"
import {DEFAULT_CMD_COMMANDS_DIR, DEFAULT_CMD_DIR} from "./app_config";
import {Command, CommandList, CommandExecutor, CommandSource} from "../interfaces/cmd";

const OPTION_POINTER = '--'

export class CommandLine {

    protected _command: Command

    constructor(readonly app: App) {
    }

    static parseCommand(): Command {

        const cmd = {
            command: '',
            action: '',
            options: {}
        }

        const args = process.argv.slice(2)

        args.forEach((arg, i) => {
            if (i === 0) {
                if (arg.startsWith(OPTION_POINTER)) return
                cmd.command = arg
                args[i + 1] && (args[i + 1]?.startsWith(OPTION_POINTER) || (cmd.action = args[i + 1]))
                return
            }
            if (arg.startsWith(OPTION_POINTER)) {
                arg = $.trim(arg, OPTION_POINTER)
                cmd.options[arg] = CommandLine.assignCommandOptionValues(args, arg, i) ?? true
            }
        })

        return cmd
    }

    static assignCommandOptionValues(args: string[], arg: string, index: number) {

        const values = {}

        for (let i = index; i < args.length; i++) {
            let value: any = args[i + 1]
            if (value === undefined || value.startsWith(OPTION_POINTER)) return values[arg]

            value === 'true'
                ? value = true : value === 'false'
                    ? value = false : !isNaN(parseFloat(value)) && (value = parseFloat(value))

            i > index
                ? (Array.isArray(values[arg]) ? values[arg].push(value) : values[arg] = [values[arg], value])
                : values[arg] = value
        }

        return values[arg]
    }

    get command(): Command {

        return this._command ||= CommandLine.parseCommand()
    }

    get commandsDirectory() {

        return fs.formatPath(this.app.rootDir
            + '/' + DEFAULT_CMD_DIR
            + '/' + (this.app.config.get.cli.commandDirName || DEFAULT_CMD_COMMANDS_DIR))
    }

    commandList(directory?: string): CommandList {

        directory ||= this.commandsDirectory
        const commands = []

        fs.dir(directory).forEach((file) => {
            const command = this.getCommandSourceName(file, directory)
            commands.push({command, file})
        })

        return commands
    }

    getCommandSourceName(file: string, directory: string) {

        directory = fs.formatPath(directory)

        const source = fs.parseFile(file)
        const sourceDir = fs.formatPath(source.dir)
        const path = fs.formatPath(sourceDir.replace(directory, ''))

        return path ? path + '/' + source.name : source.name
    }

    getCommandSource(name: string, directory?: string): CommandSource | void {

        for (const {file, command} of this.commandList(directory)) {
            if (command === name) return {
                command,
                file,
                get: () => fs.include(file)
            }
        }
    }

    get system() {

        const dir = require('path').resolve(__dirname, '../../bin/' + DEFAULT_CMD_COMMANDS_DIR)

        return {
            directory: dir,
            source: (commandName?: string) => this.getCommandSource(commandName, dir),
            commands: () => this.commandList(dir),
            run: (commandName?: string) => this.run(commandName, dir)
        }
    }

    async run(commandName?: string, directory?: string) {

        commandName ||= this.command.command

        if (!commandName) return

        const source = this.getCommandSource(commandName, directory)

        if (!source) throw `The "${commandName}" command's source is not found.`

        const executor = source.get()

        if (!executor) throw `Cannot find the executor for "${commandName}" command's source.`

        return await this.execute(executor)
    }

    async execute(executor: CommandExecutor) {

        const data = executor instanceof Function ? await executor({app: this.app, cmd: this}) : executor

        if (!(data instanceof Object)) return

        const command = $.hyphen2Camel(this.command.action)

        const action = command && data[command] instanceof Function ? data[command] : null

        if (!action) return

        const options = this.command.options

        const args = {}

        Object.keys(options).forEach(k => args[$.hyphen2Camel(k)] = options[k])

        const values = object.arrangeFuncArguments(action).map(a => a.arg in args ? args[a.arg] : undefined)

        return await Reflect.apply(action, data, values)
    }
}
