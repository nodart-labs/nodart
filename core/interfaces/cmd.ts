export type Command = {
  command: string;
  action: string;
  options: { [key: string]: any };
};

export type CommandExecutor = (...args) => any | { [key: string]: any };

export type CommandSource = {
  command: string;
  file: string;
  get: () => CommandExecutor;
};

export type CommandList = CommandSource[];

export interface CommandLineConfigInterface {
  commandDirName?: string; // commands directory name
}
