
<p align="center" dir="auto">
<img src="sources/img/nodart-logo.svg" width="90">
</p>
<h3 align="center">NodArt - The Art of Node.js.</h3>
<h3 align="center">A complete web framework 
<br/>
for creating microservices and 
<br/>
large-scale server-side applications for businesses
</h3>
<p align="center" dir="auto">
<br/>
<a href="https://github.com/nodart-labs/nodart.git">
<img align="center" src="sources/img/badges/stable.svg" height="20">
</a>
<a href="https://github.com/nodart-labs/nodart.git">
<img align="center" src="sources/img/badges/release.svg" height="20">
</a>
<a href="https://github.com/nodart-labs/nodart.git">
<img align="center" src="sources/img/badges/license.svg" height="20">
</a>
</p>


---


The framework adheres to the concept of "just install and use".
Everything you need to run a server application:

1. **MVC; OOP (TypeScript, ECMAScript 6)**
2. **ORM client, Working with databases (MySQL, PostgresSQL, SQLite, MSSQL, OracleDB, CockroachDB, Amazon Redshift)**
3. **Working with a session**
4. **Templating**
5. **Error and Exception handling**
6. **Working with a command line; Creation of custom commands**
7. **Routing**
8. **Custom events and states**
9. **Dependency injection**
10. **Observer pattern**
11. **Repository pattern**

Everything of this is provided out of the hood.
All that is needed for some of the above things to work is to specify the basic settings
in the configuration file.

The framework provides a very flexible architecture,
making it easy to extend and customize all of these things,
up to and including completely changing the basic behavior
by specifying class loaders and references in the same configuration file.

The framework is independent, thus it doesn't rely on other frameworks like Express.

---


### APPLICATION CREATION, INITIALISATION AND START

#### 1. GIT

it downloads the current framework version's application with full usage examples.

```
git clone https://github.com/nodart-labs/nodart-app.git
```

#### 2. CLI

it creates a base application structure with some usage examples.

```
npx nodart create-app
```

---

#### 3. INITIALISATION AND START


You can launch microservice or monolithic apps, or you can combine them, depending on the requirements. 
In this <a target="_blank" href="https://fauna.com/blog/how-to-build-microservices-with-node-js">article</a>, 
you can read more about application architecture.


**BASIC INITIALISATION:**

```typescript

import {App} from "nodart"

const config = require('./config')

// Be aware that this fundamental initialization 
// automatically creates the necessary app files and folders.
// (database folder, controllers folder, models folder, services folder, views folder and etc.)

new App({...config}).init().then(app => {

    const server = app.serve(3000, 'http', '127.0.0.1')
    
    // do anything on startup, for example:

    // configure server:
    server.timeout = 30000 // setting max timeout on requests

    // or create payload for all HTTP requests:
    app.setHttpRequestPayload((req, res) => {})
    
    // or launch HTTP service: 
    const http = app.service.http()
    
    http.get('url/path/with/:params', (scope) => {})
    
})

```

---

**STARTING HTTP SERVICE:**

```typescript

import {App} from "nodart"

const config = require('./config')

const {app, http, server} = new App({...config}).start(3000)

// base HTTP processing:

http.get('/path/:first/:second/:+optional_id?', ({route, respond, http}) => {
    
    const {first, second, optional_id} = route.params
    
    const {queryParam} = route.query

    // sending template from views folder:
    respond.send.view('path/to/template', {queryParam})

    // sending file:
    http.sendFile('path/to/file.png', 'image/png')
    
    // sending response JSON:
    respond.send.data({first, second, optional_id}, 200)
    // or just:
    return {first, second, optional_id}

})

// fetching data from POST request:

http.post('/', ({http}) => {

    const {someData} = http.data

})

// fetching data from POST miltipart/form-data:

http.post('/', async ({http}) => {

    const {fields, files} = await http.form.fetchFormData()

})

// connecting services and models:

import {SampleService} from "./services/sample"
import {SampleModel} from "./models/sample"

http.get('/', async ({service, model}) => {

    const sampleService = service.sample as SampleService
    const sampleModel = model.sample as SampleModel

    const users = await sampleModel.query.select().table('users')

    sampleService.scope.http.send({users})

})

```

---

### START UNDER DEVELOPMENT SERVER
```
npm run dev
```

### START UNDER PRODUCTION
```
npm run start
```

---

### COMMAND LINE INTERFACE

### System Commands:
```
npx nodart [command name] [command action (optional)] --[argument name (optional)] [argument value]
```

### App Commands:
```
node cmd [command name] [command action (optional)] --[argument name (optional)] [argument value]
```

---


### DATABASE MIGRATION CLI

#### Creating and running a Single Migration
```
npx nodart migrate make --name migration-name
```
```
npx nodart migrate up | down
```

#### Creating and running the Group of Migrations in a single file
```
npx nodart migrate make-source --name source-name --migrations[optional] migration1 migration2 ...
```
```
npx nodart migrate source-up | source-down --name source-name --migrations[optional] migration1 migration2 ...
```

#### Roll back the latest migration
```
npx nodart migrate rollback --all[optional]
```

#### Run all migrations that have not yet been run
```
npx nodart migrate latest
```

#### Retrieve and return the current migration version
```
npx nodart migrate version
```

#### Return list of completed and pending migrations
```
npx nodart migrate list
```

#### Forcibly unlock the migrations lock table, and ensure that there is only one row in it
```
npx nodart migrate unlock
```

---

### DATABASE SEED CLI

#### Creates a new seed file, with the name of the seed file being added.
If the seed directory config is an array of paths, the seed file will be generated in the latest specified.
```
npx nodart seed make --name seed-name
```
```
npx nodart seed run
```

#### Creating and running the Group of Seeds in a single file
```
npx nodart seed make-source --name source-name --seeds[optional] seed1 seed2 ...
```
```
npx nodart seed source-run --name source-name --seeds[optional] seed1 seed2 ...
```

---

#### <font color=orange>Documentation is processing. The link will be available as soon as possible.</font>

