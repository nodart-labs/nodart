import {$, fs} from '../utils'
import {App} from './app'
import {DependencyInterceptor} from "./di";

export abstract class AppLoader extends DependencyInterceptor {

    protected _repository: string = ''

    protected _repositoryPath: string = ''

    protected _pathSuffix: string = ''

    protected _source: any

    protected constructor(readonly app: App) {
        super()
    }

    abstract onCall(target: any, args?: any[]): void

    abstract onGenerate(repository: string): void

    getDependency(acceptor: any, property: string, dependency: any): any {
    }

    get rootDir() {

        return this.app.rootDir
    }

    get repository() {

        return this._repository
    }

    set repository(name: string) {

        this._repository = $.trimPathEnd(name)
    }

    get sourceType() {

        return undefined
    }

    setSource(object: any): void {

        this._source = object
    }

    load(path: string, sourceType?: any, rootDir?: string) {

        return fs.getSource(this.absPath(path, rootDir), sourceType || this.sourceType)
    }

    require(path: string, sourceType?: any, rootDir?: string) {

        this._source = this.load(path, sourceType, rootDir)

        return this
    }

    call(args: any[] = [], path?: string, sourceType?: any, rootDir?: string) {

        path && this.require(path, sourceType, rootDir)

        this.onCall(this._source, args)

        this._source = this.resolve(this._source, args)

        this.intercept()

        return this._source
    }

    resolve(source?: any, args?: any[]): any {

        if (source?.prototype?.constructor) return Reflect.construct(source, args || [])

        return source
    }

    intercept(source?: any, app?: App) {

        app ||= this.app

        app.di.intercept(source || this._source, this)
    }

    async generate() {

        const repo = this.getRepo()

        this.app.isStart || fs.isDir(repo) || fs.mkDeepDir(repo)

        await this.onGenerate(repo)
    }

    getRepo(rootDir?: string, repoName?: string): string {

        if (rootDir || repoName) {

            rootDir ||= this.rootDir

            repoName ||= this.repository

            return fs.join(rootDir, repoName)
        }

        if (!this.repository) return ''

        return this._repositoryPath ||= fs.join(this.rootDir, this.repository)
    }

    absPath(path: string, rootDir?: string): string {

        const repo = this.getRepo(rootDir)

        path = this.securePath(path)

        return repo ? fs.join(repo, path) + this._pathSuffix : ''
    }

    isSource(path: string, rootDir?: string) {

        return fs.isFile(this.absPath(path, rootDir), ['ts', 'js'])
    }

    isFile(path: string, rootDir?: string) {

        return fs.isFile(this.absPath(path, rootDir))
    }

    securePath(path: string) {

        path ||= ''

        return path.includes('.') ? path.replace(/(\.\.\\|\.\.\/)/g, '') : path
    }

}
