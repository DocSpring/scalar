import { describe, expect, it, vi } from 'vitest'

import { createApiClientApp } from './create-api-client-app'
import { enableConsoleWarn } from '@scalar/api-client/vitest.setup'

describe('createApiClientApp', () => {
  it('renders something', async () => {
    vi.unmock('@scalar/api-client/hooks/useSidebar')
    vi.unmock('@scalar/api-client/hooks/useLayout')
    enableConsoleWarn()

    const element = document.createElement('div')
    element.id = 'scalar-client'
    document.body.appendChild(element)

    expect(element).not.toBeNull()
    expect(element.innerHTML).not.toContain('Request')

    createApiClientApp(element, {
      proxyUrl: 'https://proxy.scalar.com',
    })

    // Make sure we wait for the client to be mounted
    await vi.waitFor(() => expect(element.innerHTML).toContain('My First Request'), { timeout: 5000 })
  })
})
