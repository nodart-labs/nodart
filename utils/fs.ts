import {$, object} from './index'

const fs = require('fs')

const stat = (path: string) => fs.existsSync(path) ? fs.statSync(path) : null

const dir = (directory: string): string[] => {
    if (!isDir(directory)) return []
    let results = []
    const list = fs.readdirSync(directory)
    list.forEach(function (file) {
        file = directory + '/' + file
        isDir(file) ? results = results.concat(dir(file)) : (isFile(file) && results.push(file))
    })
    return results
}

const write = (path: string, data: string = '') => {
    fs.writeFileSync(path, data)
}

const isFile = (path: string, ext?: string[]): boolean => {
    const exists = (path, ext) => !!stat(path + '.' + $.trim(ext, '.'))?.isFile()
    return ext ? !!ext.some(ext => exists(path, ext)) : !!stat(path)?.isFile()
}

const isDir = (path: string): boolean => !!stat(path)?.isDirectory()

const json = (path: string): object | boolean => {
    try {
        if (isFile(path)) return JSON.parse(fs.readFileSync(path, 'utf8'))
        return false
    } catch (e) {
        console.error(e)
        return false
    }
}

const read = (path: string) => isFile(path) ? fs.readFileSync(path, 'utf8') : null

const mkdir = (path: string, chmod: number = 0o744) => fs.mkdirSync(path, chmod)

const mkDeepDir = (path: string, chmod = 0o744) => fs.mkdirSync(path, {recursive: true, mode: chmod})

const copy = (src: string, dest: string, callback: Function = (() => undefined), chmod: number): boolean => {
    if (isFile(src)) {
        fs.copyFile(src, dest, chmod, callback)
        return true
    }
    return false
}

const getSource = (path: string, sourceProtoObject?: any): any | void => {

    const source = require(path)

    if (!(source instanceof Object)) return

    for (let key of Object.keys(source)) {

        if (object.isProtoConstructor(source[key], sourceProtoObject)) return source[key]
    }

    return source
}

export = {
    fs,
    stat,
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
}
