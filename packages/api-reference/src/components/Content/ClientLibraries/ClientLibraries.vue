<script setup lang="ts">
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { ScalarCodeBlock, ScalarMarkdown } from '@scalar/components'
import type { AvailableClients } from '@scalar/snippetz'
import type { WorkspaceDocument } from '@scalar/workspace-store/schemas/schemas/workspace'
import { computed, useId, useTemplateRef } from 'vue'

import { DEFAULT_CLIENT } from '@/v2/blocks/scalar-request-example-block/helpers/find-client'
import type { ClientOptionGroup } from '@/v2/blocks/scalar-request-example-block/types'
import { emitCustomEvent } from '@/v2/events/definitions'

import ClientSelector from './ClientSelector.vue'
import { getFeaturedClients, isFeaturedClient } from './featured-clients'

const {
  clientOptions,
  document,
  selectedClient = DEFAULT_CLIENT,
} = defineProps<{
  /** Current document from the store */
  document: WorkspaceDocument
  /** Computed list of all available Http Client options */
  clientOptions: ClientOptionGroup[]
  /** The currently selected Http Client */
  selectedClient?: AvailableClients[number] | string
}>()

// Get DocSpring clients for featured tabs
const docSpringClients = getDocSpringClients()

const morePanel = useId()

/** Grab the option for the currently selected Http Client */
const selectedClientOption = computed(() => {
  // First try to find in the regular clientOptions
  let result: ClientOption | undefined = clientOptions.flatMap(
    (option) =>
      option.options.find((option) => option.id === selectedClient) ?? [],
  )[0]

  // If not found and selectedClient is a DocSpring client, look in DocSpring clients
  if (!result && selectedClient?.startsWith('custom/')) {
    result = docSpringClients.options.find(
      (client) => client.id === selectedClient,
    )
  }

  return result
})

/** List of featured clients - hide JavaScript and Elixir to fit row */
const featuredClients = computed(() =>
  docSpringClients.options.filter(
    (c) => !['custom/js', 'custom/elixir'].includes(c.id),
  ),
)

/** Currently selected tab index */
const tabIndex = computed(() => {
  const index = featuredClients.value.findIndex(
    (featuredClient) => selectedClient === featuredClient.id,
  )
  // Return -1 if not a featured client to deselect all tabs
  return index >= 0 ? index : -1
})

/** Non-featured DocSpring clients for the "More" dropdown */
const nonFeaturedDocSpringClients = computed(() => {
  const featured = featuredClients.value.map((c) => c.id)
  return docSpringClients.options.filter(
    (client) => !featured.includes(client.id),
  )
})

/** Client options for the dropdown - non-featured DocSpring clients + all other HTTP clients */
const moreClientOptions = computed(() => {
  // Check if DocSpring clients are already included in the clientOptions prop
  const hasDocSpringInProps = clientOptions.some(
    (group) => group.label === 'DocSpring API Clients',
  )

  if (hasDocSpringInProps) {
    // DocSpring clients are already in props, just filter out the featured ones from the DocSpring group
    return clientOptions
      .map((group) => {
        if (group.label === 'DocSpring API Clients') {
          // Only show non-featured DocSpring clients in the dropdown
          const featuredIds = featuredClients.value.map((c) => c.id)
          return {
            ...group,
            options: group.options.filter(
              (client) => !featuredIds.includes(client.id),
            ),
          }
        }
        return group
      })
      .filter((group) => group.options.length > 0) // Remove empty groups
  } else {
    // DocSpring clients not in props, add them manually (legacy behavior)
    const options = [...clientOptions]

    if (nonFeaturedDocSpringClients.value.length > 0) {
      options.unshift({
        label: 'DocSpring API Clients',
        options: nonFeaturedDocSpringClients.value,
      })
    }

    return options
  }
})

const wrapperRef = useTemplateRef('wrapper')

// Local copy-to-clipboard handler for pre-rendered expressive-code blocks
const { copyToClipboard } = useClipboard()
function handleExpressiveCodeCopy(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target) return
  const button = target.closest(
    '.expressive-code .copy button[data-code]',
  ) as HTMLElement | null
  if (!button) return
  let content = (button.getAttribute('data-code') || '').replace(
    /\u007f/g,
    '\n',
  )
  if (!content) {
    const scope = button.closest('.expressive-code') as HTMLElement | null
    const codeEl = scope?.querySelector('pre code') as HTMLElement | null
    content = codeEl?.textContent || ''
  }
  if (!content) return
  event.preventDefault()
  event.stopPropagation()
  copyToClipboard(content)
}

onMounted(() => {
  if (wrapperRef.value) {
    // Use capture to avoid other handlers preventing our copy
    wrapperRef.value.addEventListener('click', handleExpressiveCodeCopy, true)
  }
})

onBeforeUnmount(() => {
  if (wrapperRef.value) {
    wrapperRef.value.removeEventListener(
      'click',
      handleExpressiveCodeCopy,
      true,
    )
  }
})

/** Emit the selected client event on tab */
const onTabSelect = (i: number) => {
  const client = featuredClients.value[i]

  if (!client || !wrapperRef.value) {
    return
  }

  emitCustomEvent(wrapperRef.value, 'scalar-update-selected-client', client.id)
}

const installationInstructions = computed(() => {
  // Get instructions (if we have any)
  const XScalarSdkInstallation = document.info['x-scalar-sdk-installation']

  // Check whether we have instructions at all
  if (
    !Array.isArray(XScalarSdkInstallation) ||
    !XScalarSdkInstallation?.length
  ) {
    return undefined
  }

  // Find the instructions for the current language
  const langToMatch = selectedClient?.startsWith('custom/')
    ? selectedClient.substring('custom/'.length)
    : null

  const instruction = XScalarSdkInstallation.find((instruction) => {
    // Only match custom clients - we don't use any others
    if (!selectedClient?.startsWith('custom/')) {
      return false
    }

    // For custom clients (like DocSpring), use the language after 'custom/'
    return instruction.lang.toLowerCase() === langToMatch?.toLowerCase()
  })

  return instruction
})

// Expose for testing
defineExpose({
  selectedClientOption,
  installationInstructions,
})

// ---------------------------------------------------------------------------
// Replace placeholders in pre-rendered HTML with current credentials, masking secrets
const { securitySchemes } = useWorkspace()
const { activeCollection } = useActiveEntities()

function htmlEscape(str: string) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function resolveActiveBasicCredentials() {
  // Normalize selected security-scheme UIDs to a flat string[]
  const normalizeUids = (input: unknown): string[] => {
    if (Array.isArray(input)) return (input as unknown[]).flat().map(String)
    if (input == null) return []
    return [String(input)]
  }

  let username: string | undefined
  let password: string | undefined

  const selectedUids = normalizeUids(
    activeCollection.value?.selectedSecuritySchemeUids,
  )
  const selectedSchemes = selectedUids
    .map((uid) => (securitySchemes as Record<string, any>)[uid])
    .filter(Boolean)

  const allSchemes = selectedSchemes.length
    ? selectedSchemes
    : Object.values(securitySchemes as Record<string, any>)
  const basic = allSchemes.find(
    (s: any) => s?.type === 'http' && s?.scheme === 'basic',
  ) as any
  if (basic) {
    username = (basic as any).username as string | undefined
    password = (basic as any).password as string | undefined
  }

  return { username, password }
}

const processedInstallationHtml = computed(() => {
  const html = installationInstructions.value?.html
  if (!html) return undefined

  const { username, password } = resolveActiveBasicCredentials()

  const windowDoc = window.document
  const container = windowDoc.createElement('div')
  container.innerHTML = html

  // Helper: span-wrapped secret
  const buildSecretNode = (secret: string) => {
    const outer = windowDoc.createElement('span')
    outer.className = 'credential'
    const inner = windowDoc.createElement('span')
    inner.className = 'credential-value'
    inner.textContent = secret
    outer.appendChild(inner)
    return outer
  }

  // Replace placeholders in TEXT NODES (body content)
  const walker = windowDoc.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const v = node.nodeValue || ''
        return v.includes('API_TOKEN_ID') || v.includes('API_TOKEN_SECRET')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT
      },
    } as any,
    false,
  )

  const textNodes: Text[] = []
  for (let n = walker.nextNode(); n; n = walker.nextNode())
    textNodes.push(n as Text)

  textNodes.forEach((textNode) => {
    let v = textNode.nodeValue || ''

    if (username && v.includes('API_TOKEN_ID')) {
      v = v.replaceAll('API_TOKEN_ID', username)
    }

    if (password && v.includes('API_TOKEN_SECRET')) {
      const parts = v.split('API_TOKEN_SECRET')
      const frag = windowDoc.createDocumentFragment()
      parts.forEach((part, i) => {
        if (part) {
          frag.appendChild(windowDoc.createTextNode(part))
        }
        if (i < parts.length - 1) {
          frag.appendChild(buildSecretNode(password))
        }
      })
      textNode.replaceWith(frag)
    } else if (v !== textNode.nodeValue) {
      textNode.nodeValue = v
    }
  })

  // Replace placeholders in ATTRIBUTES with plain values (e.g., data-code)
  const allEls = container.querySelectorAll('*')
  allEls.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      let val = attr.value
      if (username && val.includes('API_TOKEN_ID')) {
        val = val.replaceAll('API_TOKEN_ID', username)
      }
      if (password && val.includes('API_TOKEN_SECRET')) {
        val = val.replaceAll('API_TOKEN_SECRET', password)
      }
      if (val !== attr.value) {
        el.setAttribute(attr.name, val)
      }
    })
  })

  return container.innerHTML
})

// Mapping for ScalarMarkdown to replace and mask credentials in markdown
// For markdown content: replace API_TOKEN_ID inline (unmasked), mask only API_TOKEN_SECRET
const processedInstallationDescription = computed(() => {
  const d = installationInstructions.value?.description
  if (!d) return d
  const { username } = resolveActiveBasicCredentials()
  return username ? d.replaceAll('API_TOKEN_ID', username) : d
})

const markdownReplaceAndMask = computed(() => {
  const { password } = resolveActiveBasicCredentials()
  return {
    API_TOKEN_SECRET: password,
  } as Record<string, string | undefined>
})
</script>
<template>
  <div
    v-if="clientOptions.length"
    id="client-libraries"
    ref="wrapper"
    class="client-libraries-wrapper">
    <TabGroup
      manual
      :selectedIndex="tabIndex"
      @change="onTabSelect">
      <!-- Tabs -->
      <TabList
        aria-label="Client Libraries"
        class="client-libraries-list">
        <ClientSelector
          :clientOptions="moreClientOptions"
          :featuredClients
          :morePanel
          :selectedClient />
      </TabList>

      <!-- Content -->
      <TabPanels v-show="tabIndex !== -1">
        <TabPanel
          v-for="client in featuredClients"
          :key="client.id"
          class="selected-client card-footer -outline-offset-2">
          <template
            v-if="
              selectedClient === client.id &&
              (installationInstructions?.description ||
                installationInstructions?.html)
            ">
            <div
              v-if="installationInstructions.html"
              class="instruction-content instruction-html"
              v-html="processedInstallationHtml" />
            <div
              v-if="installationInstructions.description"
              class="instruction-content"
              :class="installationInstructions.source && 'has-source'">
              <ScalarMarkdown
                :replaceAndMaskCredentials="markdownReplaceAndMask"
                :value="processedInstallationDescription" />

              <StarlightCard
                classNames="my-3 mt-5"
                description="Make an API call to confirm that authentication is working"
                href="#tag/authentication/get/authentication"
                title="Test Authentication" />
            </div>
            <div
              v-if="installationInstructions.source"
              class="instruction-source">
              <ScalarCodeBlock
                class="code-block-compact"
                :content="installationInstructions.source"
                :copy="true"
                lang="shell" />
            </div>
          </template>
          <template v-else>
            <div
              class="client-library-info-pane skip-scalar-reset sl-markdown-content default-client-info">
              <h3>{{ client.title }}</h3>
              <p>
                Code examples will be shown using the
                {{ client.title }} library.
              </p>
            </div>
          </template>
        </TabPanel>
      </TabPanels>
      <!-- More panel - shown when non-featured client is selected -->
      <div
        v-if="tabIndex === -1"
        :id="morePanel"
        class="selected-client card-footer -outline-offset-2"
        role="tabpanel"
        tabindex="0">
        <template
          v-if="
            installationInstructions?.description ||
            installationInstructions?.html
          ">
          <div
            v-if="installationInstructions.html"
            class="instruction-content instruction-html"
            v-html="processedInstallationHtml" />
          <div
            v-if="installationInstructions.description"
            class="instruction-content"
            :class="installationInstructions.source && 'has-source'">
            <ScalarMarkdown
              :replaceAndMaskCredentials="markdownReplaceAndMask"
              :value="processedInstallationDescription" />

            <StarlightCard
              classNames="mt-3"
              description="Make an API call to confirm that authentication is working"
              href="#tag/authentication/get/authentication"
              title="Test Authentication" />
          </div>
          <div
            v-if="installationInstructions.source"
            class="instruction-source">
            <ScalarCodeBlock
              class="code-block-compact"
              :content="installationInstructions.source"
              :copy="true"
              lang="shell" />
          </div>
        </template>
        <template v-else>
          <div
            class="client-library-info-pane skip-scalar-reset sl-markdown-content default-client-info">
            <h3>{{ selectedClientOption?.title }}</h3>
            <p>
              Code examples will be shown using the
              {{ selectedClientOption?.title }} library.
            </p>
          </div>
        </template>
      </div>
    </TabGroup>
  </div>
</template>
<style scoped>
.client-libraries-wrapper {
  margin-bottom: 4rem;
}
.selected-client {
  color: var(--scalar-color-1);
  font-size: var(--scalar-small);
  font-family: var(--scalar-font-code);
  padding: 9px 12px;
  border-top: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--scalar-background-1);
  border: var(--scalar-border-width) solid var(--scalar-border-color);
  border-bottom-left-radius: var(--scalar-radius-lg);
  border-bottom-right-radius: var(--scalar-radius-lg);
  min-height: fit-content;
}
.client-libraries-list :deep(.client-libraries-content) {
  border: var(--scalar-border-width) solid var(--scalar-border-color);
}

.instruction-content,
.instruction-html {
  max-width: 45rem;
  margin-left: auto;
  margin-right: auto;
}
:deep(.scalar-codeblock-pre .hljs) {
  margin-top: 8px;
}
.instruction-content {
  padding: 0;
}
.instruction-content.has-source {
  padding-bottom: 12px;
}
.instruction-source {
  border-top: var(--scalar-border-width) solid var(--scalar-border-color);
  margin: 0 -12px -9px;
}
.code-block-compact {
  background: transparent;
  padding: 9px 12px;
}
.code-block-compact :deep(.scalar-codeblock-pre) {
  background: transparent;
  padding: 0;
}
</style>
