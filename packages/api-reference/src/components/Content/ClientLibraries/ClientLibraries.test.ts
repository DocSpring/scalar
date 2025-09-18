import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { DEFAULT_CLIENT } from '@/v2/blocks/scalar-request-example-block/helpers/find-client'
import type { ClientOptionGroup } from '@/v2/blocks/scalar-request-example-block/types'
import type { WorkspaceDocument } from '@scalar/workspace-store/schemas/schemas/workspace'

import ClientLibraries from './ClientLibraries.vue'

describe('ClientLibraries', () => {
  // Mock data setup
  const mockDocument: WorkspaceDocument = {
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    paths: {},
    openapi: '3.0.0',
  }

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
      ],
    },
  ]

  const globalMountOptions = {
    stubs: {
      ScalarCodeBlock: {
        props: ['content'],
        template: '<pre class="scalar-code-block">{{ content }}</pre>',
      },
      ScalarMarkdown: {
        props: ['value'],
        template: '<div class="scalar-markdown">{{ value }}</div>',
      },
      ClientSelector: true,
    },
    provide: {
      [WORKSPACE_SYMBOL]: {
        securitySchemes: reactive({}),
      },
      [ACTIVE_ENTITIES_SYMBOL]: {
        activeCollection: ref({ selectedSecuritySchemeUids: [] }),
      },
    },
  }

  describe('default client selection', () => {
    it('uses DEFAULT_CLIENT when no selectedClient is provided', () => {
      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocument,
          clientOptions: mockClientOptions,
          // selectedClient is not provided, should default to DEFAULT_CLIENT
        },
        global: globalMountOptions,
      })

      // The component should render with the default client
      expect(wrapper.exists()).toBe(true)

      // In Vue 3 with script setup, we need to access exposed properties
      const vm = wrapper.vm as any

      // Now that we've added defineExpose, we should be able to access the computed properties
      expect(vm.selectedClientOption).toBeDefined()
      expect(vm.selectedClientOption.id).toBe(DEFAULT_CLIENT)
    })

    it('uses provided selectedClient when available', () => {
      const customClient = 'custom/python'

      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocument,
          clientOptions: mockClientOptions,
          selectedClient: customClient,
        },
        global: globalMountOptions,
      })

      // The component should render with the custom client
      expect(wrapper.exists()).toBe(true)

      // The selectedClientOption computed property should resolve to the custom client
      const vm = wrapper.vm as any
      expect(vm.selectedClientOption?.id).toBe(customClient)
    })

    it('handles undefined selectedClient gracefully', () => {
      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocument,
          clientOptions: mockClientOptions,
          selectedClient: undefined,
        },
        global: globalMountOptions,
      })

      // The component should render without errors
      expect(wrapper.exists()).toBe(true)

      // The selectedClientOption computed property should resolve to the default client (shell/curl)
      const vm = wrapper.vm as any
      expect(vm.selectedClientOption?.id).toBe(DEFAULT_CLIENT)
    })
  })

  describe('x-scalar-sdk-installation matching', () => {
    it('shows installation instructions for custom clients', () => {
      const mockDocumentWithInstructions: WorkspaceDocument = {
        ...mockDocument,
        info: {
          ...mockDocument.info,
          'x-scalar-sdk-installation': [
            {
              label: 'DocSpring Ruby',
              lang: 'ruby',
              source: 'gem install docspring',
              description: 'Official DocSpring Ruby SDK',
            },
            {
              label: 'DocSpring Python',
              lang: 'python',
              source: 'pip install docspring',
              description: 'Official DocSpring Python SDK',
            },
          ],
        },
      }

      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocumentWithInstructions,
          clientOptions: mockClientOptions,
          selectedClient: 'custom/ruby',
        },
        global: globalMountOptions,
      })

      const vm = wrapper.vm as any
      expect(vm.installationInstructions).toBeDefined()
      expect(vm.installationInstructions).toEqual({
        label: 'DocSpring Ruby',
        lang: 'ruby',
        source: 'gem install docspring',
        description: 'Official DocSpring Ruby SDK',
      })
    })

    it('matches custom client languages correctly', () => {
      const mockDocumentWithInstructions: WorkspaceDocument = {
        ...mockDocument,
        info: {
          ...mockDocument.info,
          'x-scalar-sdk-installation': [
            {
              label: 'DocSpring JavaScript',
              lang: 'js',
              source: 'npm install docspring',
              description: 'Official DocSpring JavaScript SDK',
            },
          ],
        },
      }

      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocumentWithInstructions,
          clientOptions: mockClientOptions,
          selectedClient: 'custom/js',
        },
        global: globalMountOptions,
      })

      const vm = wrapper.vm as any
      expect(vm.installationInstructions).toBeDefined()
      expect(vm.installationInstructions).toEqual({
        label: 'DocSpring JavaScript',
        lang: 'js',
        source: 'npm install docspring',
        description: 'Official DocSpring JavaScript SDK',
      })
    })

    it('does NOT match regular ruby clients to custom ruby instructions', () => {
      const mockDocumentWithInstructions: WorkspaceDocument = {
        ...mockDocument,
        info: {
          ...mockDocument.info,
          'x-scalar-sdk-installation': [
            {
              label: 'DocSpring Ruby',
              lang: 'ruby',
              source: 'gem install docspring',
              description: 'Official DocSpring Ruby SDK',
            },
          ],
        },
      }

      // Add a regular ruby client to the options
      const optionsWithRubyNetHttp = [
        ...mockClientOptions,
        {
          label: 'Ruby',
          options: [
            {
              id: 'ruby/net-http',
              label: 'Net::HTTP',
              lang: 'ruby',
              title: 'Ruby Net::HTTP',
              targetKey: 'ruby',
              targetTitle: 'Ruby',
              clientKey: 'net-http',
            },
          ],
        },
      ]

      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocumentWithInstructions,
          clientOptions: optionsWithRubyNetHttp,
          selectedClient: 'ruby/net-http',
        },
        global: globalMountOptions,
      })

      const vm = wrapper.vm as any
      // Should NOT match because ruby/net-http is not a custom client
      expect(vm.installationInstructions).toBeUndefined()
    })

    it('only matches custom clients to their specific language instructions', () => {
      const mockDocumentWithInstructions: WorkspaceDocument = {
        ...mockDocument,
        info: {
          ...mockDocument.info,
          'x-scalar-sdk-installation': [
            {
              label: 'DocSpring Ruby',
              lang: 'ruby',
              source: 'gem install docspring',
              description: 'Official DocSpring Ruby SDK',
            },
            {
              label: 'DocSpring Python',
              lang: 'python',
              source: 'pip install docspring',
              description: 'Official DocSpring Python SDK',
            },
          ],
        },
      }

      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocumentWithInstructions,
          clientOptions: mockClientOptions,
          selectedClient: 'custom/ruby',
        },
        global: globalMountOptions,
      })

      const vm = wrapper.vm as any
      expect(vm.installationInstructions).toBeDefined()
      expect(vm.installationInstructions.lang).toBe('ruby')
      expect(vm.installationInstructions.source).toBe('gem install docspring')
    })

    it('returns undefined when no matching installation instructions exist', () => {
      const mockDocumentWithInstructions: WorkspaceDocument = {
        ...mockDocument,
        info: {
          ...mockDocument.info,
          'x-scalar-sdk-installation': [
            {
              label: 'DocSpring Ruby',
              lang: 'ruby',
              source: 'gem install docspring',
              description: 'Official DocSpring Ruby SDK',
            },
          ],
        },
      }

      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocumentWithInstructions,
          clientOptions: mockClientOptions,
          selectedClient: 'custom/php', // PHP instructions not provided
        },
        global: globalMountOptions,
      })

      const vm = wrapper.vm as any
      expect(vm.installationInstructions).toBeUndefined()
    })

    it('handles missing x-scalar-sdk-installation gracefully', () => {
      const wrapper = mount(ClientLibraries, {
        props: {
          document: mockDocument, // No x-scalar-sdk-installation
          clientOptions: mockClientOptions,
          selectedClient: 'custom/ruby',
        },
        global: globalMountOptions,
      })

      const vm = wrapper.vm as any
      expect(vm.installationInstructions).toBeUndefined()
    })
  })
})
