import {$, object} from './index'
import {JSONObjectInterface} from "../interfaces/object";

const fs = require('fs')

const _path = require("path")

const stat = (path: string) => fs.existsSync(path) ? fs.statSync(path) : null

const dir = (directory: string, callback?: (data: {file?: string, directory?: string}) => void): string[] => {

    if (!isDir(directory)) return []

    let results = []

    const list = fs.readdirSync(directory)

    list.forEach(function (file) {

        file = path(directory, file)

        if (isDir(file)) {

            results = results.concat(dir(file, callback))

            callback?.({directory: file})

            return
        }

        results.push(file)

        callback?.({file})
    })

    return results
}

const rmDir = (directory: string, callback?: Function) => {

    if (!isDir(directory)) return callback?.()

    try {
        if ("rmdirSync" in fs) {
            fs.rmdirSync(directory, {recursive: true})
            isDir(directory) ? callback?.(`Could not delete directory "${directory}"`) : callback?.()
        } else {
            fs.rm(directory, {recursive: true}, (err) => callback?.(err))
        }
    } catch (e) {
        callback?.(e)
    }
}

const write = (path: string, data: string = '') => {

    fs.writeFileSync(path, data)
}

const isFile = (path: string, ext?: string[]): boolean => {

    const exists = (path, ext) => !!stat(path + '.' + $.trim(ext, '.'))?.isFile()

    return ext ? !!ext.some(ext => exists(path, ext)) : !!stat(path)?.isFile()
}

const isDir = (path: string): boolean => !!stat(path)?.isDirectory()

const json = (path: string): JSONObjectInterface | void => {
    try {
        if (isFile(path)) return JSON.parse(fs.readFileSync(path, 'utf8'))
    } catch (e) {
        console.error(e)
    }
}

const read = (path: string) => isFile(path) ? fs.readFileSync(path, 'utf8') : null

const mkdir = (path: string, chmod: number = 0o744) => fs.mkdirSync(path, chmod)

const mkDeepDir = (path: string, chmod = 0o744) => fs.mkdirSync(path, {recursive: true, mode: chmod})

const copy = (src: string, dest: string, callback: Function = (() => undefined)): boolean => {

    if (isFile(src)) {
        fs.copyFile(src, dest, callback)
        return true
    }

    return false
}

const include = (
    path: string,
    params: {
        skipExt?: boolean
        success?: Function
        error?: Function
        log?: boolean
    } = {log: true}
): any | null => {
    try {
        params.skipExt && (path = skipExtension(path))
        const data = require(path)
        params.success && params.success(data)
        return data
    } catch (e) {
        params.error && params.error(e)
        params.log && console.error(`Failed to load data from path "${path}".`, e)
        return null
    }
}

const getSource = (path: string, sourceProtoObject?: any): any | null => {

    const source = require(path)

    if (!(source instanceof Object)) return null

    for (let key of Object.keys(source)) {

        if (object.isProtoConstructor(source[key], sourceProtoObject)) return source[key]
    }

    return null
}

const filename = (path: string) => isFile(path) ? _path.basename(path) : null

const parseFile = (path: string): object => isFile(path) ? _path.parse(path) : {}

const formatPath = (path: string) => $.trimPath(path ?? '').replace(/\\/g, '/').replace(/\/$/, '')

const path = (path: string, to: string = '') => {
    return to
        ? _path.resolve(path, to)
        : _path.join(path.startsWith(_path.sep) ? path : _path.sep === '/' ? '/' + path : path, '')
}

const skipExtension = (path: string) => path.replace(/\.[a-z\d]+$/i, '')

export = {
    system: fs,
    stat,
    filename,
    parseFile,
    formatPath,
    dir,
    write,
    json,
    read,
    copy,
    isFile,
    isDir,
    mkdir,
    mkDeepDir,
    getSource,
    include,
    path,
    rmDir,
    skipExtension
}
