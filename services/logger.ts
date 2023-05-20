import { format } from "node:util";
import { AppLoggerConfigInterface } from "../core/interfaces/app";
import { $, fs } from "../utils";

export class LoggerService {
  constructor(readonly config: AppLoggerConfigInterface) {
    config.error?.useLogging &&
      (this.isErrorLogExists || this.createErrorLog());
  }

  get errorLogDirectory() {
    return this.config.error?.directory;
  }

  get errorLogFilename() {
    return this.config.error?.filename;
  }

  get errorLog() {
    return fs.join(this.errorLogDirectory, this.errorLogFilename);
  }

  get isErrorLogExists() {
    return fs.isFile(this.errorLog);
  }

  createErrorLog() {
    fs.isDir(this.errorLogDirectory) || fs.mkDeepDir(this.errorLogDirectory);
    fs.write(this.errorLog);
  }

  dumpError(error: any, httpStatusCode?: number) {
    if (!this.isErrorLogExists || !this.config.error?.useLogging) return;

    if (
      httpStatusCode &&
      false === this.isLoggingAvailableOnHttpStatus(httpStatusCode)
    )
      return;

    const dump = this.format(error);

    if (!dump) return;

    const stream = fs.system.createWriteStream(this.errorLog, {
      flags: "a",
    });

    const output = `[${this.timestamp}]: ${dump}`;

    stream.write(output);
    process.stdout.write(output);
  }

  format(data: any) {
    return data
      ? data.toString().trim()
        ? format(data).trim() + "\n"
        : ""
      : "";
  }

  get timestamp() {
    return $.date.currentDateTime();
  }

  isLoggingAvailableOnHttpStatus(httpStatusCode: number) {
    const statuses =
      Array.isArray(this.config.onHttp?.statuses) &&
      this.config.onHttp.statuses.length
        ? this.config.onHttp.statuses
        : null;
    const excludeStatuses =
      Array.isArray(this.config.onHttp?.excludeStatuses) &&
      this.config.onHttp.excludeStatuses.length
        ? this.config.onHttp.excludeStatuses
        : null;

    return !(
      (statuses && false === statuses.includes(+httpStatusCode)) ||
      (excludeStatuses && excludeStatuses.includes(+httpStatusCode))
    );
  }
}
