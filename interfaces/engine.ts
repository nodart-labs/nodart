/**
 * See template engine docs: https://mozilla.github.io/nunjucks/api.html
 */
export interface EngineConfigInterface {
    views?: string, // Templates base path
    options?: {
        autoescape?: boolean, // (default: true) controls if output with dangerous characters are escaped automatically. See Autoescaping
        throwOnUndefined?: boolean, // (default: false) throw errors when outputting a null/undefined value
        trimBlocks?: boolean, // (default: false) automatically remove trailing newlines from a block/tag
        lstripBlocks?: boolean, // (default: false) automatically remove leading whitespace from a block/tag
        watch?: boolean, // (default: false) reload templates when they are changed (server-side). To use watch, make sure optional dependency chokidar is installed.
        noCache?: boolean, // (default: false) never use a cache and recompile templates each time (server-side)
        web?: { // an object for configuring loading templates in the browser:
            useCache?: boolean, // (default: false) will enable cache and templates will never see updates.
            async?: boolean, //(default: false) will load templates asynchronously instead of synchronously (requires use of the asynchronous API for rendering).
            [addon: string]: any,
        },
        tags?: { // (default: see nunjucks syntax) defines the syntax for nunjucks tags. See Customizing Syntax
            blockStart?: string,
            blockEnd?: string,
            variableStart?: string,
            variableEnd?: string,
            commentStart?: string,
            commentEnd?: string,
            [addon: string]: any,
        },
        [addon: string]: any,
    }
}
