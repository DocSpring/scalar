import { describe, expect, it, vi } from 'vitest'

import { createApiClientWeb } from './create-api-client-web'
import { enableConsoleWarn } from '@scalar/api-client/vitest.setup'

describe('createApiClientWeb', () => {
  it('renders the client with no warnings or errors', async () => {
    vi.unmock('@scalar/api-client/hooks/useSidebar')
    vi.unmock('@scalar/api-client/hooks/useLayout')
    enableConsoleWarn()

    const element = document.createElement('div')
    element.id = 'scalar-client'
    document.body.appendChild(element)

    expect(element).not.toBeNull()
    expect(element.innerHTML).not.toContain('App Navigation')

    createApiClientWeb(element, {
      proxyUrl: 'https://proxy.scalar.com',
    })
    expect(element.innerHTML).toContain('App Navigation')

    // Make sure we wait for the client to be mounted
    await vi.waitFor(() => expect(element.innerHTML).toContain('My First Request'), { timeout: 5000 })
  })
})
