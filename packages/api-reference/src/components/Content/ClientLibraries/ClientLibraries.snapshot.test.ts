import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { ClientOptionGroup } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'
import { ACTIVE_ENTITIES_SYMBOL } from '@scalar/api-client/store/active-entities'
import { WORKSPACE_SYMBOL } from '@scalar/api-client/store/store'
import type { WorkspaceDocument } from '@scalar/workspace-store/schemas/schemas/workspace'
import { reactive, ref } from 'vue'

import ClientLibraries from './ClientLibraries.vue'

describe('ClientLibraries snapshots', () => {
  // Mock data setup
  const mockDocument: WorkspaceDocument = {
    info: {
      title: 'DocSpring API',
      version: '1.0.0',
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
        {
          label: 'DocSpring JavaScript',
          lang: 'js',
          source: 'npm install docspring',
          description: 'Official DocSpring JavaScript SDK',
        },
        {
          label: 'DocSpring PHP',
          lang: 'php',
          source: 'composer require docspring/docspring',
          description: 'Official DocSpring PHP SDK',
        },
        {
          label: 'DocSpring Java',
          lang: 'java',
          source: 'implementation "com.docspring:docspring:1.0.0"',
          description: 'Official DocSpring Java SDK',
        },
        {
          label: 'DocSpring C#',
          lang: 'csharp',
          source: 'dotnet add package DocSpring',
          description: 'Official DocSpring C# SDK',
        },
      ],
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

  it('renders with custom/ruby selected', () => {
    const wrapper = mount(ClientLibraries, {
      props: {
        document: mockDocument,
        clientOptions: mockClientOptions,
        selectedClient: 'custom/ruby',
      },
      global: globalMountOptions,
    })

    expect(wrapper.text()).toContain('DocSpring Ruby')
    expect(wrapper.text()).toContain('Official DocSpring Ruby SDK')
    expect(wrapper.text()).toContain('gem install docspring')
  })

  it('renders with custom/python selected', () => {
    const wrapper = mount(ClientLibraries, {
      props: {
        document: mockDocument,
        clientOptions: mockClientOptions,
        selectedClient: 'custom/python',
      },
      global: globalMountOptions,
    })

    expect(wrapper.text()).toContain('DocSpring Python')
    expect(wrapper.text()).toContain('Official DocSpring Python SDK')
    expect(wrapper.text()).toContain('pip install docspring')
  })

  it('renders with custom/js selected', () => {
    const wrapper = mount(ClientLibraries, {
      props: {
        document: mockDocument,
        clientOptions: mockClientOptions,
        selectedClient: 'custom/js',
      },
      global: globalMountOptions,
    })

    expect(wrapper.text()).toContain('DocSpring JavaScript')
    expect(wrapper.text()).toContain('Official DocSpring JavaScript SDK')
    expect(wrapper.text()).toContain('npm install docspring')
  })

  it('renders with non-custom client selected (should not show installation instructions)', () => {
    const optionsWithNonCustom = [
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
        document: mockDocument,
        clientOptions: optionsWithNonCustom,
        selectedClient: 'ruby/net-http',
      },
      global: globalMountOptions,
    })

    const text = wrapper.text()
    expect(text).toContain('Ruby Net::HTTP')
    expect(text).toContain('Code examples will be shown using the Ruby Net::HTTP library.')
    expect(text).not.toContain('Official DocSpring Ruby SDK')
  })

  it('renders without x-scalar-sdk-installation', () => {
    const documentWithoutInstallation: WorkspaceDocument = {
      info: {
        title: 'DocSpring API',
        version: '1.0.0',
      },
      paths: {},
      openapi: '3.0.0',
    }

    const wrapper = mount(ClientLibraries, {
      props: {
        document: documentWithoutInstallation,
        clientOptions: mockClientOptions,
        selectedClient: 'custom/ruby',
      },
      global: globalMountOptions,
    })

    const text = wrapper.text()
    expect(text).toContain('DocSpring Ruby')
    expect(text).toContain('Code examples will be shown using the DocSpring Ruby library.')
  })

  it('renders with custom/php selected (no matching installation instructions)', () => {
    // Remove PHP from installation instructions but keep it in client options
    const documentWithoutPhp: WorkspaceDocument = {
      info: {
        title: 'DocSpring API',
        version: '1.0.0',
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
      paths: {},
      openapi: '3.0.0',
    }

    const wrapper = mount(ClientLibraries, {
      props: {
        document: documentWithoutPhp,
        clientOptions: mockClientOptions,
        selectedClient: 'custom/php',
      },
      global: globalMountOptions,
    })

    const text = wrapper.text()
    expect(text).toContain('DocSpring PHP')
    expect(text).toContain('Code examples will be shown using the DocSpring PHP library.')
  })
})
