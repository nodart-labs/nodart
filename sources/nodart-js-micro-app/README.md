
## "NODART" FRAMEWORK

### INSTALL APPLICATION

### System requirements:

* OS Linux or Windows
* Node.js >= **v16.14.2**


### 1. GIT

it downloads the current framework version's application with full usage examples.
```shell
git clone https://github.com/nodart-labs/nodart-app.git
```

### 2. CLI

it creates a base application structure with some usage examples.
```shell
npx nodart create-app
```

it creates a microservice application file. Use flag "--js" when you are not using typescript in project.
```shell
npx nodart microapp --js[optional]
```

---

### RUN UNDER DEVELOPMENT SERVER
```shell
npm run dev
```

### RUN UNDER PRODUCTION
```shell
npm run start
```

---

### COMMAND LINE INTERFACE

### System Commands:
```shell
npx nodart [command name] [command action (optional)] --[argument name (optional)] [argument value]
```

### App Commands:
```shell
node cmd [command name] [command action (optional)] --[argument name (optional)] [argument value]
```

---

### DATABASE MIGRATION CLI

#### Creating and running a Single Migration
```shell
npx nodart migrate make --name migration-name
```
```shell
npx nodart migrate up | down
```

#### Creating and running the Group of Migrations in a single file
```shell
npx nodart migrate make-source --name source-name --migrations[optional] migration1 migration2 ...
```
```shell
npx nodart migrate source-up | source-down --name source-name --migrations[optional] migration1 migration2 ...
```

#### Roll back the latest migration
```shell
npx nodart migrate rollback --all[optional]
```

#### Run all migrations that have not yet been run
```shell
npx nodart migrate latest
```

#### Retrieve and return the current migration version
```shell
npx nodart migrate version
```

#### Return list of completed and pending migrations
```shell
npx nodart migrate list
```

#### Forcibly unlock the migrations lock table, and ensure that there is only one row in it
```shell
npx nodart migrate unlock
```

---

### DATABASE SEED CLI

#### Creates a new seed file, with the name of the seed file being added.
If the seed directory config is an array of paths, the seed file will be generated in the latest specified.
```shell
npx nodart seed make --name seed-name
```
```shell
npx nodart seed run
```

#### Creating and running the Group of Seeds in a single file
```shell
npx nodart seed make-source --name source-name --seeds[optional] seed1 seed2 ...
```
```shell
npx nodart seed source-run --name source-name --seeds[optional] seed1 seed2 ...
```
