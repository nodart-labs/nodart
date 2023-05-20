"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const node_util_1 = require("node:util");
const utils_1 = require("../utils");
class LoggerService {
    constructor(config) {
        var _a;
        this.config = config;
        ((_a = config.error) === null || _a === void 0 ? void 0 : _a.useLogging) &&
            (this.isErrorLogExists || this.createErrorLog());
    }
    get errorLogDirectory() {
        var _a;
        return (_a = this.config.error) === null || _a === void 0 ? void 0 : _a.directory;
    }
    get errorLogFilename() {
        var _a;
        return (_a = this.config.error) === null || _a === void 0 ? void 0 : _a.filename;
    }
    get errorLog() {
        return utils_1.fs.join(this.errorLogDirectory, this.errorLogFilename);
    }
    get isErrorLogExists() {
        return utils_1.fs.isFile(this.errorLog);
    }
    createErrorLog() {
        utils_1.fs.isDir(this.errorLogDirectory) || utils_1.fs.mkDeepDir(this.errorLogDirectory);
        utils_1.fs.write(this.errorLog);
    }
    dumpError(error, httpStatusCode) {
        var _a;
        if (!this.isErrorLogExists || !((_a = this.config.error) === null || _a === void 0 ? void 0 : _a.useLogging))
            return;
        if (httpStatusCode &&
            false === this.isLoggingAvailableOnHttpStatus(httpStatusCode))
            return;
        const dump = this.format(error);
        if (!dump)
            return;
        const stream = utils_1.fs.system.createWriteStream(this.errorLog, {
            flags: "a",
        });
        const output = `[${this.timestamp}]: ${dump}`;
        stream.write(output);
        process.stdout.write(output);
    }
    format(data) {
        return data
            ? data.toString().trim()
                ? (0, node_util_1.format)(data).trim() + "\n"
                : ""
            : "";
    }
    get timestamp() {
        return utils_1.$.date.currentDateTime();
    }
    isLoggingAvailableOnHttpStatus(httpStatusCode) {
        var _a, _b;
        const statuses = Array.isArray((_a = this.config.onHttp) === null || _a === void 0 ? void 0 : _a.statuses) &&
            this.config.onHttp.statuses.length
            ? this.config.onHttp.statuses
            : null;
        const excludeStatuses = Array.isArray((_b = this.config.onHttp) === null || _b === void 0 ? void 0 : _b.excludeStatuses) &&
            this.config.onHttp.excludeStatuses.length
            ? this.config.onHttp.excludeStatuses
            : null;
        return !((statuses && false === statuses.includes(+httpStatusCode)) ||
            (excludeStatuses && excludeStatuses.includes(+httpStatusCode)));
    }
}
exports.LoggerService = LoggerService;
//# sourceMappingURL=logger.js.map