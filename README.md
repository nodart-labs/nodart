<p align="center" dir="auto">
<img src="sources/img/nodart-logo.svg" width="130">
</p>
<h1 align="center">NodArt - The Art of Node.js</h1>
<h3 align="center">A complete framework 
<br/>
for creating microservices and 
<br/>
large-scale server-side applications for businesses
</h3>
<p align="center" dir="auto">
<br/>
<a href="https://github.com/nodart-labs/nodart.git">
<img align="center" src="sources/img/badges/node.svg" height="20">
</a>
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
12. **Module pattern**

Everything of this is provided out of the hood.
All that is needed for some of the above things to work is to specify the basic settings
in the configuration file.

The framework provides a very flexible architecture,
making it easy to extend and customize all of these things,
up to and including completely changing the basic behavior
by specifying class loaders and references in the same configuration file.

The framework is independent, thus it doesn't rely on other frameworks like Express.

---

## APPLICATION CREATION, INITIALISATION AND START

### System requirements:

- OS Linux or Windows
- Node.js >= **v16.14.2**

#### 1. GIT

it downloads the current framework version's application with full usage examples.

```shell
git clone https://github.com/nodart-labs/nodart-app.git
```

#### 2. CLI

it creates a base application structure from cli.

```shell
npx nodart create-app
```

it creates a microservice application file. Use flag "--js" when you are not using typescript in project.

```shell
npx nodart microapp --js[optional]
```

---

#### 3. INITIALISATION AND START

You can launch microservice or monolithic apps, or you can combine them, depending on the requirements.
In this <a target="_blank" href="https://fauna.com/blog/how-to-build-microservices-with-node-js">article</a>,
you can read more about application architecture.

**BASIC INITIALISATION:**

```typescript
import { App } from "nodart";

const config = require("./config");

/**
    Be aware that this fundamental initialization 
    automatically creates the necessary app files and folders.
    (database folder, controllers folder, models folder, 
    services folder, views folder and etc.)
*/

new App({ ...config }).init().then(async (app) => {
  const server = await app.serve(3000, "http", "127.0.0.1");

  // do anything on startup, for example:

  // configure server:
  server.timeout = 30000; // setting max timeout on requests

  // or create payload for all HTTP requests:
  app.service.setRequestPayload((req, res) => {});

  // or launch HTTP service:
  const http = app.service.http;

  http.get("url/path/with/:params", (scope) => {});
});
```

---

### STARTING HTTP SERVICE

```typescript
import { App } from "nodart";

const config = require("./config");

new App({ ...config }).start(3000).then(({ app, http, server }) => {
  // base HTTP processing:

  http.get("/path/:first/:second/:+optional_id?", ({ route, http }) => {
    const { first, second, optional_id } = route.params;

    const { httpQueryStringParam } = http.query;

    // sending template from views folder:
    http.respond.view("path/to/template/from/views/folder", { queryParam });

    // sending file:
    http.sendFile("absolute/path/to/file.png", "image/png");

    // sending response JSON:
    http.respond.data({ first, second, optional_id }, 200);
    // or
    http.send({ first, second, optional_id }, 200, "application/json");
    // or just:
    return { first, second, optional_id };

    // throwing HttpException. The message will be sent to user.
    http.throw(500, "some error occurred.");

    // throwing RuntimeException. The message will not be sent to user,
    // but shown in server logs.
    http.exit(500, "some error occurred.", { someData });
  });

  // fetching data from POST request:

  http.post("/", ({ http }) => {
    const { someData } = http.data;
  });

  // fetching data from POST miltipart/form-data:

  http.post("/", async ({ http }) => {
    const { fields, files } = await http.form.fetchFormData();

    const stat = http.form.stat("field_name");
  });

  // dealing with services and models:

  import { SampleService } from "./services/sample";
  import { SampleModel } from "./models/subfolder/sample";

  http.get("/", async ({ service, model }) => {
    const sampleService = service().sample as SampleService;
    const sampleModel = model().subfolder.sample as SampleModel;

    const users = await sampleModel.query.select().table("users");

    sampleService.scope.http.send({ users });
  });
});

// "./services/sample.ts"

import { Service } from "nodart";

export class SampleService extends Service {
  get orm() {
    return this.scope.app.service.db.orm; // or this.scope.app.get('orm').call()
  }
}
```

## SPECIFYING LOADERS

You can change the basic behavior of class loaders by specifying in the base project configuration

```typescript
import { App, ControllerLoader, nodart } from "nodart";

class ControllerLoaderOverride extends ControllerLoader {
  protected _pathSuffix = "Controller";
}

const config = <nodart.app.AppConfigInterface>{
  loaders: {
    controller: ControllerLoaderOverride,
  },
};

new App(config);
```

---

## RELATION MODEL

> An abstract class called `RelationModel` enhances the functionality of the standard query builder. The system by default use the well-liked `Knex` query builder: https://knexjs.org/guide/

> Using pre-written database queries, `RelationModel` enables you to create query blanks and chain them together into a series of inquiries. In this manner, retrieving a list or a single object from the database does not require you to always develop new methods in the data model.

### **USAGE SAMPLE**:

### `@/models/Book.ts`:

```typescript
import { RelationModel } from "nodart";

export interface IBook {
  id: number;
  author_id: number;
  name: string;
  meta_keywords: string;
  meta_description: string;
}

export class Book extends RelationModel {
  declare model: IBook;

  get table() {
    return "books";
  }

  static get table() {
    return "books";
  }

  statements = (query: this["query"]) => ({
    author: <T extends string>(author_id: number) =>
      query.where("author_id", author_id) as T extends "list"
        ? Promise<IBook[]>
        : Promise<IBook>,
  });
}
```

### `@/controllers/BooksController.ts`:

```typescript
import { Controller, nodart } from "nodart";
import { Book, IBook } from "@/models/Book";

const statuses = nodart.http.HTTP_STATUS;

export class BooksController extends Controller {
  model = {
    Book: {} as Book,
  };

  declare book: Book;

  /**
   * @property data?: {Object<{action: string}>}
   */
  init() {
    this.book = this.model.Book;
  }

  /**
   @returns: {Object<IBook>}
   */
  async get(id: number) {
    // Be aware to use the "result" property
    // at the end of the call chain.

    return await this.book.use.get({ id }).result;
  }

  /**
   @returns: {Array<IBook>}
   */
  async list(author_id: number) {
    // The "result" property is not required
    // after "on" property.

    return await this.book.use.list("id", "name").on.author(author_id);
  }

  async patch(id: number) {
    const { name } = this.http.data;
    const result = await this.book.use.set({ name }).at({ id }).result;

    return result ? { ok: true } : this.http.throw(statuses.NOT_FOUND);
  }

  async post() {
    const data = this.http.data as IBook;
    const result = await this.book.use.add(data).result; // Array<number>;

    return { ok: !!result?.[0] };
  }

  async delete(id: number) {
    const result = await this.book.use.delete({ id }).result;

    return { ok: !!result };
  }
}
```

---

## DATA MUTABLE

> `nodart.mutable.MutableInterface` is an interface that provides a property with methods to cast the source data to the desired data model.

### **USAGE SAMPLE**:

### `@/models/Book.ts`:

```typescript
import { RelationModel, nodart } from "nodart";

export interface IBook {
  id: number;
  author_id: number;
  name: string;
  meta_keywords: string;
  meta_description: string;
}

export interface IBookAPI
  extends Omit<IBook, "meta_keywords" | "meta_description"> {
  meta: {
    description: string;
    keywords: string;
  };
}

export interface IBookMutable extends nodart.mutable.DataMutable {
  book(data: IBook): [Partial<IBookAPI>, (keyof IBook)[]];
}

/**
  RelationModel implements nodart.mutable.MutableInterface
*/
export class Book extends RelationModel {
  declare model: IBook;

  get table() {
    return "books";
  }

  static get table() {
    return "books";
  }

  readonly mutable: IBookMutable = {
    book: (data) => [
      // This data will be assigned to the source data:
      {
        meta: {
          description: data.meta_description,
          keywords: data.meta_keywords,
        },
      },
      // This optional part specifies which properties
      // will be excluded from the source data:
      ["meta_description", "meta_keywords"],
    ],
  };

  statements = (query: this["query"]) => ({
    author: <T extends string>(author_id: number) =>
      query.where("author_id", author_id) as T extends "list"
        ? Promise<IBook[]>
        : Promise<IBook>,
  });
}
```

### `@/controllers/BooksController.ts`:

```typescript
import { Controller } from "nodart";
import { Book } from "@/models/Book";

export class BooksController extends Controller {
  model = {
    Book: {} as Book,
  };

  declare book: Book;

  /**
   * @property data?: {Object<{action: string}>}
   */
  init() {
    this.book = this.model.Book;
  }

  /**
   @returns: {Object<IBookAPI>} -> {
      id: number;
      author_id: number;
      name: string;
      meta: { 
        description: string;
        keywords: string;
      }
    }
   */
  async get(id: number) {
    const data = await this.book.use.get({ id }).result;

    return this.book.mutate.get.book(data);
  }

  /**
   @returns: {Array<IBookAPI>}
   */
  async list(author_id: number) {
    const data = await this.book.use.list().on.author<"list">(author_id);

    return this.book.mutate.list.book(data);
  }
}
```

---

## ROUTING

> ROUTING is one of the main components of any backend and frontend application. Simplicity and clarity, as well as further support of the entire application, depends on the convenience of configuring routing. The routing system in the nodart framework is optimized for fast search and navigation.

> Basic routing is defined in the configuration file and described as JSON notation:

```typescript
import { nodart } from "nodart";

export = <nodart.app.AppConfigInterface>{
  ...

  routes: <nodart.router.RouteEntry>{
    /** The entry "path/Book" specifies the path
    * to your "BooksController"
    * under the "controllers" folder.
    * */
    "path/Books": [
      {
        /**
         * The ":" pointer defines the route parameter entry;
         *
         * The "+" pointer indicates that the parameter is
         *   of a numeric type, and casts its value to a number
         *   if the value is of a numeric type;
         *
         * The "?" pointer indicates that the parameter
         *   is optional and may not be in the route path;
         */
        path: "/:category/books/:+id?",

        /**
         * The "action" property defines which controller's
         * method must be called
         * (if not specified then the controller's action
         * named by the current HTTP method will be called)
         */
        action: "list",

        /** The "method" property defines HTTP method on which
         * the action must be called ("any" by default)
         */
        method: "get",
      },
      {
        path: "/books/:category/:name",

        /** Validating and filtering route parameters: */
        types: {
          category: (value) => {

            return ["history", "adventure"].includes(value)
              ? value
              : null;
          },
          name: /(^book-)/ // Starts with "book-" in name
        },
      }
    ]
  }

  ...
}
```

**Now we can simplify the above example in "inline" manner:**

```typescript
import { nodart } from "nodart";

export = <nodart.app.AppConfigInterface>{
  ...

  routes: <nodart.router.RouteEntry>{
    "path/Books:list": "@get:/:category/books/:+id?",

    "path/MyBooks": [
      "@get:/my/book/:id",
      "@patch:@put:/my/book/:id",
    ]
  }

  ...
}
```

**Alternatively, we can call controller methods by appending the name of the HTTP method to the class method:**

```typescript
routes: <nodart.router.RouteEntry>{
  "path/Books:myBook": "/my/books/:+id?",
};
```

```typescript
export class BooksController extends Controller {

  getMyBook(id) {
    ...
  }

  postMyBook() {
    ...
  }

  patchMyBook(id) {
    ...
  }

  deleteMyBook(id) {
    ...
  }
}
```

---

## CREATION OF CUSTOM SERVER

```typescript
new App({ ...config }).init().then(async (app) => {
  const server = await app.serve(3000, "https", "127.0.0.1", () => {
    const fs = require("fs");

    const ssl = {
      cert: fs.readFileSync("./localhost.crt"),
      key: fs.readFileSync("./localhost.key"),
    };

    return require("https").createServer(ssl);
  });
});
```

```typescript
new App({ ...config })
  .start(3000, "http", "127.0.0.1", (app) => {
    return require("http").createServer((req, res) => {
      app.resolveHttpRequest(req, res);
    });
  })
  .then(({ app, http, server }) => {
    //...
  });
```

---

### START UNDER DEVELOPMENT

```shell
npm run dev
```

### START UNDER PRODUCTION

```shell
npm run start
```

---

## COMMAND LINE INTERFACE

### System Commands:

```shell
npx nodart [command name] [command action optional] --[argument name optional] [argument value]
```

### Project Commands:

```shell
node cmd [command name] [command action optional] --[argument name optional] [argument value]
```

---

### DATABASE MIGRATION CLI

> Before making migrations you should insert database configuration options into "cmd/index.js" file

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

```shell
npx nodart migrate all-source-up | all-source-down --exclude[optional] excluded-migration-sourcename
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

```shell
npx nodart seed all-source-run --exclude[optional] excluded-seed-sourcename
```

---

## BENCHMARKS

The framework is built on the premise that performance
and functionality should be perfectly balanced.
The performance of some well-known **server-side** frameworks is compared here.

> Spoiler message: As you can see, the NodArt framework is not far behind the fastest Fastify,
> and in some aspects surpasses it and all other frameworks.

Environment:

- Computer: AMD Ryzen 5 4600H Radeon, 3000 MHz, 6 Cores, SSD, 16 Gb RAM
- Benchmarking tool: <a href="https://www.npmjs.com/package/autocannon">AutoCannon</a>
- Benchmarking command:

`autocannon -R 10000 http://localhost:3000`

_(10000 requests per second; Total connections/users: 10; Total time: 10 seconds)_

### 1. Testing simple JSON response:

```typescript
http.get("/", () => {
  return { hello: "world" };
});
```

| Framework         | Bytes/sec   | Requests/sec |
| ----------------- | ----------- | ------------ |
| Fastify v4.0.0    | 1.91 MB     | 10183        |
| **NodArt v4.2.0** | **2.02 MB** | **10143**    |
| Express v4.18.2   | 1.94 MB     | 7683         |
| Nest.js v9.0.0    | 1.61 MB     | 6395         |

### 2. Testing parametric route:

```typescript
http.get("/test/:param1/:param2/:param3/:param4", ({ route }) => {
  const { param1, param2, param3, param4 } = route.params;
  return { param1, param2, param3, param4 };
});
```

| Framework         | Bytes/sec   | Requests/sec |
| ----------------- | ----------- | ------------ |
| Fastify v4.0.0    | 2.27 MB     | 10143        |
| **NodArt v4.2.0** | **2.45 MB** | **10127**    |
| Express v4.18.2   | 2.17 MB     | 7531         |
| Nest.js v9.0.0    | 1.8 MB      | 6239         |

### 3. Testing static file serve:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Title</title>
  </head>
  <body>
    <h1>Hello world!</h1>
  </body>
</html>
```

| Framework         | Bytes/sec  | Requests/sec |
| ----------------- | ---------- | ------------ |
| **NodArt v4.2.0** | **4.4 MB** | **7955**     |
| Fastify v4.0.0    | 2.32 MB    | 5295         |
| Express v4.18.2   | 2 MB       | 4343         |
| Nest.js v9.0.0    | 1.87 MB    | 4057         |

---

### Support

Join the development team, we will be happy to consider any of your
ideas and codebase that will be included in the next release.

> **email**: nodart.labs@gmail.com

> **issue reports**: https://github.com/nodart-labs/nodart/issues
