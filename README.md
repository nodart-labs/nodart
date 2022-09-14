## TYPESCRIPT BACKEND FRAMEWORK

---

### INSTALL APPLICATION

### 1. GIT
```
git clone https://github.com/nodart-labs/nodart-app.git
```
downloads current version's application with full usage examples.

### 2. CLI
```
npx nodart create-app
```
creates base application structure with some usage examples.

---

### RUN UNDER DEVELOPMENT SERVER
```
npm run dev
```

### RUN UNDER PRODUCTION
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


### APPLICATION START EXAMPLE

```typescript

import {App} from 'nodart'
const config = require('./config')

new App({...config}).init().then(app => app.serve(3000, 'http', '127.0.0.1'))

```

