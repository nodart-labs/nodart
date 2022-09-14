#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const copydir = require('copy-dir')
const exclude = ['.idea', '.git', 'node_modules']
const target =  path.resolve(__dirname, '../nodart-github')

if (fs.existsSync(target)) {

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
        filter: function(stat, filepath) {
            if (stat === 'directory') return false === exclude.some(item => filepath.includes(item))
            return true
        }
    })
}

const app =  path.resolve(__dirname, '../nodart-github-app')
const appCli =  path.resolve(__dirname, '../nodart-cli-app')
const pack = JSON.parse(fs.readFileSync('package.json', {encoding: "utf-8"}))
const ver = (str, version) => str.replace(/("nodart")(\s*:\s*")([^"]+)/, `$1$2^${version}`)

if (fs.existsSync(app + '/package.json')) {

    const appPackage = fs.readFileSync(app + '/package.json', {encoding: "utf-8"})

    fs.writeFileSync(app + '/package.json', ver(appPackage, pack.version), {encoding: "utf-8"})
}

if (fs.existsSync(appCli + '/package.json')) {

    const targetZip = path.resolve(__dirname, 'sources/nodart-app')

    const excludeMod = [...exclude, ...['.history']]

    fs.existsSync(targetZip) && fs.rmdirSync(targetZip, {recursive: true})

    copydir.sync(appCli, targetZip, {
        utimes: true,  // keep add time and modify time
        mode: true,    // keep file mode
        cover: true,    // cover file when exists, default is true
        filter: function(stat, filepath, filename) {
            if (stat === 'directory') return false === excludeMod.some(item => filepath.includes(item))
            return false === [
                'package-lock.json',
                '.sqlite',
                '.DS_Store',
                '.log'
            ].some(item => filename.includes(item))
        }
    })

    if (fs.existsSync(targetZip + '/package.json')) {

        const appCliSourcePackage = fs.readFileSync(targetZip + '/package.json', {encoding: "utf-8"})

        fs.writeFileSync(targetZip + '/package.json', ver(appCliSourcePackage, pack.version), {encoding: "utf-8"})

        fs.existsSync(targetZip + '.zip') && fs.unlinkSync(targetZip + '.zip')

        console.log('CREATING:', `7z a -tzip ${targetZip + '.zip'} ${targetZip}`)

        require('child_process').execFileSync('7z', ['a', '-tzip', targetZip + '.zip', targetZip], {
            shell: true,
            encoding: "utf-8"
        })

        fs.rmdirSync(targetZip, {recursive: true})

    }
}

process.exit()
