## TYPESCRIPT BACKEND FRAMEWORK


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

new App({...config}).init().then(app => app.serve(3000))

```


