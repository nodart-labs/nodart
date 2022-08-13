import {$} from './index'

const fs = require('fs')

const stat = (path) => fs.existsSync(path) ? fs.statSync(path) : null

const dir = (dir) => {
    if (!isDir(dir)) return []
    let results = []
    const list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        if (isDir(file)) {
            results = results.concat(dir(file))
        } else if (isFile(file)) {
            results.push(file)
        }
    })
    return results
}

const write = (path, data) => {
    fs.writeFileSync(path, data?.toString() ?? '')
}

const isFile  = (path, ext?: string[]) => {
    const exists = (path, ext) => !!stat(path + '.' + $.trim(ext, '.'))?.isFile()
    return ext ? !!ext.some(ext => exists(path, ext)) : !!stat(path)?.isFile()
}

const isDir  = (path) => !!stat(path)?.isDirectory()

const json = (path) => isFile(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : null

const read = (path) => isFile(path) ? fs.readFileSync(path, 'utf8') : null

const mkdir = (path, chmod = 0o744) => fs.mkdirSync(path, chmod)

const copy = (src, dest, callback, chmod) => isFile(src) ? fs.copyFile(src, dest, chmod, callback ?? (() => {})) : false

export = {
    fs,
    stat,
    dir,
    write,
    json,
    read,
    isFile,
    isDir,
    mkdir,
    copy
}
