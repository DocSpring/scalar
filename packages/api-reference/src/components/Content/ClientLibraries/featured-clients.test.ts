import { describe, expect, it } from 'vitest'
import { getFeaturedClients, isFeaturedClient } from './featured-clients'
import type { ClientOptionGroup } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'

// Use our custom DocSpring clients for testing
const DEFAULT_FEATURED_CLIENTS = [
  'custom/ruby',
  'custom/python',
  'custom/js',
  'custom/php',
  'custom/java',
  'custom/csharp',
] as const

describe('featured-clients', () => {
  // Test data setup
  const mockClientOptions: ClientOptionGroup[] = [
    {
      label: 'DocSpring API Clients',
      options: [
        {
          id: 'custom/ruby',
          label: 'DocSpring Ruby',
          lang: 'ruby',
          title: 'DocSpring Ruby',
          targetKey: 'custom',
          targetTitle: 'DocSpring',
          clientKey: 'ruby',
        },
        {
          id: 'custom/python',
          label: 'DocSpring Python',
          lang: 'python',
          title: 'DocSpring Python',
          targetKey: 'custom',
          targetTitle: 'DocSpring',
          clientKey: 'python',
        },
        {
          id: 'custom/js',
          label: 'DocSpring JavaScript',
          lang: 'js',
          title: 'DocSpring JavaScript',
          targetKey: 'custom',
          targetTitle: 'DocSpring',
          clientKey: 'js',
        },
        {
          id: 'custom/php',
          label: 'DocSpring PHP',
          lang: 'php',
          title: 'DocSpring PHP',
          targetKey: 'custom',
          targetTitle: 'DocSpring',
          clientKey: 'php',
        },
        {
          id: 'custom/java',
          label: 'DocSpring Java',
          lang: 'java',
          title: 'DocSpring Java',
          targetKey: 'custom',
          targetTitle: 'DocSpring',
          clientKey: 'java',
        },
        {
          id: 'custom/csharp',
          label: 'DocSpring C#',
          lang: 'csharp',
          title: 'DocSpring C#',
          targetKey: 'custom',
          targetTitle: 'DocSpring',
          clientKey: 'csharp',
        },
      ],
    },
    {
      label: 'Shell',
      options: [
        {
          id: 'shell/curl',
          label: 'cURL',
          lang: 'curl',
          title: 'Shell cURL',
          targetKey: 'shell',
          targetTitle: 'Shell',
          clientKey: 'curl',
        },
        {
          id: 'shell/httpie',
          label: 'HTTPie',
          lang: 'shell',
          title: 'Shell HTTPie',
          targetKey: 'shell',
          targetTitle: 'Shell',
          clientKey: 'httpie',
        },
      ],
    },
    {
      label: 'Python',
      options: [
        {
          id: 'python/requests',
          label: 'Requests',
          lang: 'python',
          title: 'Python Requests',
          targetKey: 'python',
          targetTitle: 'Python',
          clientKey: 'requests',
        },
      ],
    },
  ]

  describe('isFeaturedClient', () => {
    describe('when clientId is a featured client', () => {
      it('should return true for custom/ruby', () => {
        const result = isFeaturedClient('custom/ruby')
        expect(result).toBe(true)
      })

      it('should return true for custom/python', () => {
        const result = isFeaturedClient('custom/python')
        expect(result).toBe(true)
      })

      it('should return true for custom/js', () => {
        const result = isFeaturedClient('custom/js')
        expect(result).toBe(true)
      })

      it('should return true for custom/php', () => {
        const result = isFeaturedClient('custom/php')
        expect(result).toBe(true)
      })

      it('should return true for custom/java', () => {
        const result = isFeaturedClient('custom/java')
        expect(result).toBe(true)
      })

      it('should return true for custom/csharp', () => {
        const result = isFeaturedClient('custom/csharp')
        expect(result).toBe(true)
      })
    })

    describe('when clientId is not a featured client', () => {
      it('should return false for non-featured client', () => {
        const result = isFeaturedClient('shell/httpie')
        expect(result).toBe(false)
      })

      it('should return false for another non-featured client', () => {
        const result = isFeaturedClient('js/fetch')
        expect(result).toBe(false)
      })

      it('should return false for python/requests', () => {
        const result = isFeaturedClient('python/requests')
        expect(result).toBe(false)
      })
    })

    describe('when clientId is undefined', () => {
      it('should return false for undefined clientId', () => {
        const result = isFeaturedClient(undefined)
        expect(result).toBe(false)
      })
    })

    describe('with custom featured clients list', () => {
      it('should use custom featured clients list', () => {
        const customFeaturedClients = ['node/fetch', 'python/requests'] as any
        const result = isFeaturedClient('node/fetch', customFeaturedClients)
        expect(result).toBe(true)
      })

      it('should return false for client not in custom list', () => {
        const customFeaturedClients = ['node/fetch', 'python/requests'] as any
        const result = isFeaturedClient('shell/curl', customFeaturedClients)
        expect(result).toBe(false)
      })

      it('should return false for undefined with custom list', () => {
        const customFeaturedClients = ['node/fetch', 'python/requests'] as any
        const result = isFeaturedClient(undefined, customFeaturedClients)
        expect(result).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should handle empty featured clients list', () => {
        const emptyFeaturedClients: any = []
        const result = isFeaturedClient('shell/curl', emptyFeaturedClients)
        expect(result).toBe(false)
      })

      it('should handle single item featured clients list', () => {
        const singleFeaturedClient = ['node/fetch'] as any
        const result = isFeaturedClient('node/fetch', singleFeaturedClient)
        expect(result).toBe(true)
      })
    })
  })

  describe('getFeaturedClients', () => {
    describe('with default featured clients', () => {
      it('should return only featured clients from the options', () => {
        const result = getFeaturedClients(mockClientOptions)

        expect(result).toHaveLength(6)
        expect(result.map((client) => client.id)).toEqual([
          'custom/ruby',
          'custom/python',
          'custom/js',
          'custom/php',
          'custom/java',
          'custom/csharp',
        ])
      })

      it('should maintain the order of featured clients', () => {
        const result = getFeaturedClients(mockClientOptions)

        // Check that the order matches the FEATURED_CLIENTS constant
        expect(result[0].id).toBe('custom/ruby')
        expect(result[1].id).toBe('custom/python')
        expect(result[2].id).toBe('custom/js')
        expect(result[3].id).toBe('custom/php')
        expect(result[4].id).toBe('custom/java')
        expect(result[5].id).toBe('custom/csharp')
      })

      it('should include all required properties for each client', () => {
        const result = getFeaturedClients(mockClientOptions)

        result.forEach((client) => {
          expect(client).toHaveProperty('id')
          expect(client).toHaveProperty('label')
          expect(client).toHaveProperty('lang')
          expect(client).toHaveProperty('title')
          expect(client).toHaveProperty('targetKey')
          expect(client).toHaveProperty('targetTitle')
          expect(client).toHaveProperty('clientKey')
        })
      })
    })

    describe('with custom featured clients list', () => {
      it('should return only clients from custom featured list', () => {
        const customFeaturedClients = ['node/fetch', 'ruby/httpx'] as any
        const result = getFeaturedClients(mockClientOptions, customFeaturedClients)

        expect(result).toHaveLength(0) // None of these are in our mock data
      })

      it('should return clients that exist in both options and custom list', () => {
        const customFeaturedClients = ['shell/curl', 'custom/python'] as any
        const result = getFeaturedClients(mockClientOptions, customFeaturedClients)

        expect(result).toHaveLength(2)
        expect(result.map((client) => client.id)).toEqual(['shell/curl', 'custom/python'])
      })
    })

    describe('edge cases', () => {
      it('should return empty array when no featured clients are found', () => {
        const nonFeaturedOptions: ClientOptionGroup[] = [
          {
            label: 'Other Clients',
            options: [
              {
                id: 'node/fetch',
                label: 'Fetch',
                lang: 'node',
                title: 'Node.js Fetch',
                targetKey: 'node',
                targetTitle: 'Node.js',
                clientKey: 'fetch',
              },
            ],
          },
        ]

        const result = getFeaturedClients(nonFeaturedOptions)
        expect(result).toEqual([])
      })

      it('should handle empty client options', () => {
        const result = getFeaturedClients([])
        expect(result).toEqual([])
      })

      it('should handle groups with empty options arrays', () => {
        const emptyGroups: ClientOptionGroup[] = [
          {
            label: 'Empty Group',
            options: [],
          },
          {
            label: 'Valid Group',
            options: [
              {
                id: 'custom/ruby',
                label: 'DocSpring Ruby',
                lang: 'ruby',
                title: 'DocSpring Ruby',
                targetKey: 'custom',
                targetTitle: 'DocSpring',
                clientKey: 'ruby',
              },
            ],
          },
        ]

        const result = getFeaturedClients(emptyGroups)
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('custom/ruby')
      })

      it('should handle empty featured clients list', () => {
        const emptyFeaturedClients: any[] = []
        const result = getFeaturedClients(mockClientOptions, emptyFeaturedClients)
        expect(result).toEqual([])
      })

      it('should handle single item featured clients list', () => {
        const singleFeaturedClient = ['custom/ruby'] as any[]
        const result = getFeaturedClients(mockClientOptions, singleFeaturedClient)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('custom/ruby')
      })
    })

    describe('data integrity', () => {
      it('should preserve all client properties', () => {
        const result = getFeaturedClients(mockClientOptions)

        const rubyClient = result.find((client) => client.id === 'custom/ruby')
        expect(rubyClient).toEqual({
          id: 'custom/ruby',
          label: 'DocSpring Ruby',
          lang: 'ruby',
          title: 'DocSpring Ruby',
          targetKey: 'custom',
          targetTitle: 'DocSpring',
          clientKey: 'ruby',
        })
      })

      it('should not modify the original client options', () => {
        const originalOptions = JSON.parse(JSON.stringify(mockClientOptions))
        getFeaturedClients(mockClientOptions)

        expect(mockClientOptions).toEqual(originalOptions)
      })
    })
  })
})
