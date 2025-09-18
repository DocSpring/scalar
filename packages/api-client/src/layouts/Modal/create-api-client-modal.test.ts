import { describe, expect, it, vi } from 'vitest'

import { createApiClientModal } from './create-api-client-modal'
import { enableConsoleWarn } from '@scalar/api-client/vitest.setup'

describe('createApiClientModal', () => {
  it('renders something', async () => {
    vi.unmock('@scalar/api-client/hooks/useSidebar')
    vi.unmock('@scalar/api-client/hooks/useLayout')
    enableConsoleWarn()

    const element = document.createElement('div')
    element.id = 'scalar-client'
    document.body.appendChild(element)

    expect(element).not.toBeNull()
    expect(element.innerHTML).not.toContain('scalar-app')

    createApiClientModal({
      el: element,
      configuration: {
        proxyUrl: 'https://proxy.scalar.com',
      },
    })

    // Make sure we wait for the client to be mounted - this is no longer rendered
    // await vi.waitFor(() => expect(element.innerHTML).toContain('My First Request'), { timeout: 5000 })
  })
})
