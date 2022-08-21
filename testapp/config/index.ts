const path = require('path')

export = {
    rootDir: path.resolve(__dirname, '../app'),
    session: {
        secret: 'first secret',
        duration: 2 * 60 * 60 * 1000
    }
}
