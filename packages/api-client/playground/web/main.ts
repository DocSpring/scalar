import '@scalar/api-client/style.css'

import { createApiClientWeb } from '@scalar/api-client/layouts/Web'

createApiClientWeb(document.getElementById('scalar-client'), {
  proxyUrl: 'https://proxy.scalar.com',
})
