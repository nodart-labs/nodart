import {JSONLikeInterface} from "../core/interfaces/object";
import {fs, $} from "./index";

type FileData = {ext?: string, data?: JSONLikeInterface}

export class FSCashier {

    protected static _files: {[path:string]: FileData} = {}

    constructor(readonly config: {
        excludeFolders?: string[],
        extensions?: string[],
    } = {}) {
    }

    static get files() {

        return FSCashier._files
    }

    static isFile(path: string) {

        return path in FSCashier._files
    }

    createFileEntry(file: string, data?: FileData) {

        const pathSkipExt = fs.skipExtension(file)

        return {
            [file]: data,
            [pathSkipExt]: data,
            [fs.formatPath(file)]: data,
            [fs.formatPath(pathSkipExt)]: data
        }
    }

    addFile(file: string, data?: FileData) {

        if (!fs.system.existsSync(file) || !fs.isFile(file)) return

        const extension = fs.getExtension(file)

        data ||= {ext: extension, data: this.requireFileData(file, extension)}

        Object.assign(FSCashier._files, this.createFileEntry(file, data))
    }

    getFile(path: string) {

        return FSCashier._files[path]
    }

    requireFileData(file: string, extension?: string) {

        extension ||= fs.getExtension(file)

        return ['js', 'ts', 'mjs'].includes(extension) ? require(file) : {}
    }

    cacheFolder(folder: string) {

        FSCashier._files = {}

        fs.dir(folder, ({file, directory}) => {

            if (directory?.includes('.')) return false

            if (!file) return

            const extension = fs.getExtension(file)

            if (!this.config.extensions?.includes(extension)) return

            const data = {ext: extension, data: this.requireFileData(file, extension)}

            this.addFile(file, data)

        }, this.config.excludeFolders)
    }

    watchFolder(folder: string, callback?: (mode: string, file: string) => boolean | void) {

        fs.system.readdirSync(folder).forEach(path => {

            path = fs.path(folder, path)

            if (!fs.isDir(path) || path.includes('.')) return

            if (this.config.excludeFolders?.some(v => path.endsWith(fs.path(folder, v)))) return

            fs.system.watch(path, {recursive: true}, (mode, file) => {

                if (false === callback?.(mode, file)) return

                setTimeout(() => fs.system.existsSync(fs.join(path, file)) && this.cacheFolder(folder), 1)
            })
        })
    }

    watchFile(path: string, callback?: (mode: string, file: string, folder: string) => boolean | void) {

        if (!fs.system.existsSync(path) || !fs.isFile(path)) return

        const folder = require('path').dirname(path)

        fs.system.watch(path, (mode, file) => {

            if (false === callback?.(mode, file, folder)) return

            this.removeFile(path)

            file = fs.path(folder, $.trimPath(file))

            if (!fs.system.existsSync(file)) return

            const extension = fs.getExtension(file)

            const data = {ext: extension, data: this.requireFileData(file, extension)}

            this.addFile(file, data)
        })
    }

    removeFile(path: string) {

        const paths = this.createFileEntry(path)

        Object.keys(paths).forEach(key => FSCashier._files[key] && delete FSCashier._files[key])
    }

}
