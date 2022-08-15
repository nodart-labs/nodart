## TYPESCRIPT BACKEND FRAMEWORK

### <font color=orange> !!! UNDER CONSTRUCTION... </font>

---

### DOWNLOAD SAMPLE APPLICATION

```
git clone https://github.com/nodart-labs/nodart-app.git
```


### RUN APPLICATION UNDER DEVELOPMENT SERVER

```
npm run dev
```

### APPLICATION START EXAMPLE

```typescript

import {App} from 'nodart'
const config = require('./config')
const routes = require('./config/routes')

new App({...config, routes}).init().then(app => app.serve(3000))

```


