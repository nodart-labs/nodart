const {getSource} = require('../../dist/core/app_config')
const {$, fs, object} = require('../../dist/utils')

module.exports = async ({app, cmd}) => {

    cmd.system.fetchAppState(app)

    if ($.isEmpty(app.config.get.orm)) {
        console.error(`No data supplied for database configuration in directory "${cmd.appCmdDir}".`)
        process.exit(1)
    }

    const orm = () => app.db.orm

    const pattern = /^[a-z_\-\d\/]+$/i

    const fetchSeeds = (name, seeds = []) => {
        if (Array.isArray(name)) {
            seeds = name.slice(1)
            name = name.at(0)
        }
        name = $.hyphen2Camel($.trim(name, ['/', '-', '_']))
        if (!name.match(pattern)) {
            console.error('The source name is not match pattern: A-z/_-0-9')
            process.exit(1)
        }
        seeds = object.uniq(seeds.map(s => {
            s = s.toString().replace('/', '')
            if (!s.match(pattern)) {
                console.error('The seed name not match pattern: A-z_-0-9')
                process.exit(1)
            }
            return $.hyphen2Camel(s)
        }))
        return {name, seeds}
    }

    return {

        async make (name) {
            const data = fetchSeeds(name)
            name = $.camel2Snake(data.name).toLowerCase()
            await orm().seeder().make(name).then(() => console.log(
                `A new seed "${name}" was created in directory ${fs.path(orm().config.seeds.directory)}`
            ))
        },

        makeSource (name, seeds = []) {

            const data = fetchSeeds(name, seeds)

            name = data.name
            seeds = data.seeds

            const sourcePath = app.builder.envIsCommonJS ? 'migrate/js/seed_source' : 'migrate/seed_source'

            app.get('orm').generate()

            getSource(sourcePath, (file) => {

                const pathName = $.camel2Snake($.hyphen2Camel(fs.formatPath(name))).toLowerCase()
                const content = fs.read(file)

                let dest = orm().seedSources()

                if (pathName.includes('/')) {
                    const split = pathName.split('/')
                    name = split.at(-1)
                    dest += '/' + split.slice(0, -1).join('/')
                    fs.mkDeepDir(dest)
                }

                dest = fs.path(dest, $.camel2Snake(name).toLowerCase() + (app.builder.envIsCommonJS ? '.js' : '.ts'))

                if (fs.isFile(dest)) {
                    console.log(`A SEED source by path ${dest} is already in use.`)
                    process.exit(1)
                }

                let output = content.replace(/\[(NAME)]/g, $.capitalize(name))

                if (Array.isArray(seeds) && seeds.length) {
                    const parts = output.split('SEED>>>')
                    const out = [parts[0]]
                    seeds.forEach(name => out.push(parts[1].replace('[SEED_NAME]', name)))
                    out.push(parts[2])
                    output = out.join('')
                }

                output = output.replace('[SEED_NAME]', name)
                output = output.split('SEED>>>').join('')

                fs.write(dest, output)

                console.log(`A new SEED source was created by path: ${dest}`)
                process.exit()

            }, () => {
                console.error('The source file not found.')
                process.exit(1)
            })
        },

        async run () {
            cmd.system.buildApp(app)
            await orm().seeder().run().then(() => console.log('seed complete.'))
            process.exit()
        },

        async sourceRun (name, seeds = []) {
            const data = fetchSeeds(name, seeds)
            name = $.camel2Snake(data.name).toLowerCase()
            seeds = data.seeds

            cmd.system.buildApp(app)
            await orm().seeder().source(name, seeds).run().then(() => console.log('seed source complete.'))
            process.exit()
        },
    }
}
