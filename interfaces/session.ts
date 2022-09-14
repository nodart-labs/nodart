/**
 * See session supporting docs: https://github.com/mozilla/node-client-sessions
 */
export interface SessionConfigInterface {
    cookieName?: string,
    requestKey?: string, // requestKey overrides cookieName for the key name added to the request object.
    secret: string, // should be a large unguessable string or Buffer
    duration?: number,
    activeDuration?: number, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    // Advanced Cryptographic Options
    encryptionAlgorithm?: string,
    encryptionKey?: string,
    // use a SHORTER-than-default MAC:
    signatureAlgorithm?: string,
    signatureKey?: string,
    cookie?: {
        path?: string, // cookie will only be sent to requests under '/api'
        maxAge?: number, // duration of the cookie in milliseconds, defaults to duration above
        ephemeral?: boolean, // when true, cookie expires when the browser closes
        httpOnly?: boolean, // when true, cookie is not accessible from javascript
        secure?: boolean, // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
        [addon: string]: any,
    },
    [addon: string]: any,
}
