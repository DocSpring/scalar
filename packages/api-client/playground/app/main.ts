import '@scalar/api-client/style.css'

import { createApiClientApp } from '@scalar/api-client/layouts/App'

createApiClientApp(document.getElementById('scalar-client'), {
  proxyUrl: 'https://proxy.scalar.com',
})
