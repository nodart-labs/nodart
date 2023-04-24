import { JSONLikeInterface } from "../core/interfaces/object";
import { FSCashier } from "./fs_cashier";
import { $, object } from "./index";

const fs = require("fs");

const _path = require("path");

const separator = _path.sep;

const cashier = FSCashier;

const stat = function (path: string) {
  try {
    return fs.statSync(path);
  } catch {
    return null;
  }
};

const dir = function (
  directory: string,
  callback?: (data: { file?: string; directory?: string }) => boolean | void,
  excludeFolders?: string[],
): string[] {
  if (!isDir(directory)) return [];

  let results = [];

  const list = fs.readdirSync(directory);

  list.forEach(function (file) {
    file = path(directory, file);

    if (isDir(file)) {
      if (callback?.({ directory: file }) === false) return;

      if (
        excludeFolders &&
        excludeFolders.some((v) => file.endsWith(path($.trimPath(v))))
      )
        return;

      results = results.concat(dir(file, callback, excludeFolders));

      return;
    }

    const res = callback?.({ file });

    if (res === false) return;

    if (res && typeof res === "string") file = res;

    results.push(file);
  });

  return results;
};

const rmDir = function (directory: string, callback?: (...args) => any) {
  if (!isDir(directory)) return callback?.();

  try {
    if ("rmdirSync" in fs) {
      fs.rmdirSync(directory, { recursive: true });

      isDir(directory)
        ? callback?.(`Could not delete directory "${directory}"`)
        : callback?.();
    } else {
      fs.rm(directory, { recursive: true }, (err) => callback?.(err));
    }
  } catch (e) {
    callback?.(e);
  }
};

const write = function (path: string, data = ""): boolean {
  try {
    fs.writeFileSync(path, data);

    return true;
  } catch (e) {
    console.log(e);

    return false;
  }
};

const unlink = function (
  path: string,
  cb: (...args) => any = () => {},
): boolean {
  try {
    fs.unlink(path, cb);

    return true;
  } catch {
    return false;
  }
};

const isFile = function (path: string, ext?: string[]): boolean {
  const exists = (path, ext) => {
    path = path + "." + trimExtension(ext);

    return cashier.isFile(path) || !!stat(path)?.isFile();
  };

  return ext
    ? !!ext.some((ext) => exists(path, ext))
    : cashier.isFile(path) || !!stat(path)?.isFile();
};

const isDir = function (path: string): boolean {
  return !!stat(path)?.isDirectory();
};

const json = function (path: string): JSONLikeInterface | void {
  try {
    return fs.existsSync(path)
      ? JSON.parse(fs.readFileSync(path, "utf8"))
      : undefined;
  } catch {
    /* empty */
  }
};

const read = function (path: string) {
  try {
    if (fs.existsSync(path)) return fs.readFileSync(path, "utf8");
  } catch {
    /* empty */
  }
};

const mkdir = function (path: string, chmod = 0o744) {
  path && fs.mkdirSync(path, chmod);
};

const mkDeepDir = function (path: string, chmod = 0o744) {
  path && fs.mkdirSync(path, { recursive: true, mode: chmod });
};

const copy = function (
  src: string,
  dest: string,
  callback: (...args) => any = () => undefined,
): boolean {
  try {
    fs.copyFile(src, dest, callback);

    return true;
  } catch {
    return false;
  }
};

const include = function (
  path: string,
  params: {
    skipExt?: boolean;
    success?: (...args) => any;
    error?: (...args) => any;
    log?: boolean;
  } = { log: true },
): any | null {
  try {
    params.skipExt && (path = skipExtension(path));
    const data = cashier.isFile(path)
      ? cashier.files[path].data
      : require(path);
    const resolve = params.success && params.success(data);

    return resolve || data;
  } catch (e) {
    params.error && params.error(e);
    params.log && console.error(`Failed to load data from path "${path}".`, e);

    return null;
  }
};

const getSource = function (path: string, sourceProtoObject?: any): any {
  try {
    const data = cashier.isFile(path)
      ? cashier.files[path].data
      : require(path);

    if (!(data && typeof data === "object")) return;

    const keys = Object.keys(data);

    let i = 0;

    for (; i < keys.length; i++) {
      if (object.isProtoConstructor(data[keys[i]], sourceProtoObject))
        return data[keys[i]];
    }
  } catch {
    /* empty */
  }
};

const filename = function (path: string) {
  return isFile(path) ? _path.basename(path) : null;
};

const parseFile = function (path: string): object {
  return isFile(path) ? _path.parse(path) : {};
};

const formatPath = function (path: string) {
  return path ? $.trimPathEnd(path).replace(/\\/g, "/").replace(/\/$/, "") : "";
};

const path = function (path: string, to = "") {
  return to
    ? _path.resolve(path, $.trimPath(to))
    : _path.join(
        path[0] === separator ? path : separator === "/" ? "/" + path : path,
        "",
      );
};

const join = function (path: string, to: string) {
  return _path.join(path, $.trimPath(to));
};

const skipExtension = function (path: string) {
  return path.replace(/\.[a-z\d]+$/i, "");
};

const getExtension = function (path: string, withDot = false) {
  const matches = path?.match(/(\.)([^.]+?)$/g);

  return matches ? (withDot ? matches[0] : matches[0].replace(".", "")) : "";
};

const trimExtension = function (ext: string) {
  return ext.replace(/^(\.)*/g, "");
};

export = {
  system: fs,
  sep: separator,
  stat,
  filename,
  parseFile,
  formatPath,
  dir,
  write,
  json,
  read,
  unlink,
  copy,
  isFile,
  isDir,
  mkdir,
  mkDeepDir,
  getSource,
  include,
  path,
  join,
  rmDir,
  skipExtension,
  getExtension,
  trimExtension,
};
