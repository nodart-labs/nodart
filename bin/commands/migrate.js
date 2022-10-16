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

    const fetchMigrations = (name, migrations = []) => {
        if (Array.isArray(name)) {
            migrations = name.slice(1)
            name = name.at(0)
        }
        name = $.hyphen2Camel($.trim(name, ['/', '-', '_']))
        if (!name.match(pattern)) {
            console.error('The source name is not match pattern: A-z/_-0-9')
            process.exit(1)
        }
        migrations = object.uniq(migrations.map(m => {
            m = m.toString().replace('/', '')
            if (!m.match(pattern)) {
                console.error('The migration name not match pattern: A-z_-0-9')
                process.exit(1)
            }
            return $.hyphen2Camel(m)
        }))
        return {name, migrations}
    }

    return {

        async make (name) {
            const data = fetchMigrations(name)
            name = $.camel2Snake(data.name).toLowerCase()
            await orm().migrator().make(name).then(() => console.log(
                `A new migration "${name}" was created in directory ${fs.path(orm().config.migrations.directory)}`
            ))
        },

        makeSource (name, migrations = []) {

            const data = fetchMigrations(name, migrations)

            name = data.name
            migrations = data.migrations

            const sourcePath = app.builder.envIsCommonJS ? 'migrate/js/migrate_source' : 'migrate/migrate_source'

            app.get('orm').generate()

            getSource(sourcePath, (file) => {

                const pathName = $.camel2Snake($.hyphen2Camel(fs.formatPath(name))).toLowerCase()
                const content = fs.read(file)

                let dest = orm().sources()

                if (pathName.includes('/')) {
                    const split = pathName.split('/')
                    name = split.at(-1)
                    dest += '/' + split.slice(0, -1).join('/')
                    fs.mkDeepDir(dest)
                }

                dest = fs.path(dest, $.camel2Snake(name).toLowerCase() + (app.builder.envIsCommonJS ? '.js' : '.ts'))

                if (fs.isFile(dest)) {
                    console.log(`A migration source by path ${dest} is already in use.`)
                    process.exit(1)
                }

                let output = content.replace(/\[(NAME)]/g, $.capitalize(name))

                if (Array.isArray(migrations) && migrations.length) {
                    const parts = output.split('MIGRATION>>>')
                    const out = [parts[0]]
                    migrations.forEach(name => out.push(parts[1].replace('[MIGRATION_NAME]', name)))
                    out.push(parts[2])
                    output = out.join('')
                }

                output = output.replace('[MIGRATION_NAME]', name)
                output = output.split('MIGRATION>>>').join('')

                fs.write(dest, output)

                console.log(`A new migration source was created by path: ${dest}`)
                process.exit()

            }, () => {
                console.error('The source file not found.')
                process.exit(1)
            })
        },

        async up () {
            cmd.system.buildApp(app)
            await orm().migrator().up().then(() => console.log('migrate up complete.'))
            process.exit()
        },

        async down () {
            cmd.system.buildApp(app)
            await orm().migrator().down().then(() => console.log('migrate down complete.'))
            process.exit()
        },

        async sourceUp (name, migrations = []) {
            const data = fetchMigrations(name, migrations)
            name = $.camel2Snake(data.name).toLowerCase()
            migrations = data.migrations

            cmd.system.buildApp(app)
            await orm().migrator().source(name, migrations).up().then(() => console.log('migrate source up complete.'))
            process.exit()
        },

        async sourceDown (name, migrations = []) {
            const data = fetchMigrations(name, migrations)
            name = $.camel2Snake(data.name).toLowerCase()
            migrations = data.migrations

            cmd.system.buildApp(app)
            await orm().migrator().source(name, migrations).down().then(() => console.log('migrate source down complete.'))
            process.exit()
        },

        async latest () {
            cmd.system.buildApp(app)
            await orm().migrator().latest().then(() => console.log(
                'all migrations that have not yet been run are complete.'))
            process.exit()
        },

        async rollback (all = false) {
            cmd.system.buildApp(app)
            await orm().migrator().rollback(all).then(() => console.log(
                `${all ? 'all' : 'the latest'} migration group was rolled back.`))
            process.exit()
        },

        async version () {
            cmd.system.buildApp(app)
            await orm().migrator().currentVersion().then((ver) => console.log(
                `the current migration version is: ${ver}`))
            process.exit()
        },

        async list () {
            cmd.system.buildApp(app)
            await orm().migrator().list().then((list) => {
                console.log('the list of completed and pending migrations:')
                console.log(list)
            }).catch(err => {
                console.error(err?.message)
                if (err?.message?.toLowerCase().includes(
                    'the migration directory is corrupt, the following files are missing')) {
                    console.log(
                        '(This issue probably is not a mistake, ' +
                        'cause ORM client does not check the files in the custom migration sources folder.)')
                }
            })
            process.exit()
        },

        async unlock () {
            cmd.system.buildApp(app)
            await orm().migrator().unlock().then(() => console.log('the migrations lock table forcibly unlocked.'))
            process.exit()
        },
    }
}
