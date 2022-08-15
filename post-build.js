#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const copydir = require('copy-dir')
const exclude = ['.idea', '.git', 'node_modules']
const target =  path.join(__dirname, '/../nodart-github')

if (!fs.existsSync(target)) process.exit()

fs.readdirSync(target).filter(src => {

    const _path = path.join(target, src)

    const stat = fs.statSync(_path)

    if (stat.isDirectory()) {

        if (exclude.some(item => _path.includes(item))) return false

        fs.rmSync(_path, { recursive: true, force: true })

        return
    }

    fs.unlinkSync(_path)
})

copydir.sync(__dirname, target, {
    utimes: true,  // keep add time and modify time
    mode: true,    // keep file mode
    cover: true,    // cover file when exists, default is true
    filter: function(stat, filepath, filename) {
        if (stat === 'directory') return !exclude.some(item => filepath.includes(item))
        return true
    }
})

process.exit()
