<script setup lang="ts">
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { useActiveEntities, useWorkspace } from '@scalar/api-client/store'
import { DEFAULT_CLIENT } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/helpers/find-client'
// Import DocSpring clients helper
import { getDocSpringClients } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/helpers/generate-client-options'
import type {
  ClientOption,
  ClientOptionGroup,
} from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'
import { emitCustomEvent } from '@scalar/api-reference/v2/events/definitions'
import { ScalarCodeBlock, ScalarMarkdown } from '@scalar/components'
import type { AvailableClients } from '@scalar/snippetz'
import { useClipboard } from '@scalar/use-hooks/useClipboard'
import type { WorkspaceDocument } from '@scalar/workspace-store/schemas/schemas/workspace'
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  useId,
  useTemplateRef,
  type PropType,
} from 'vue'

import StarlightCard from '../../StarlightCard.vue'
import ClientSelector from './ClientSelector.vue'

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

const CLIENT_INFO_BULLETS = [
  '- Authentication with API token ID and secret',
  '- Request headers and JSON payloads',
  '- Response handling and error details',
  '- Calling API endpoints like [`testAuthentication`](#tag/authentication/get/authentication)',
]

const CLIENT_INTRO_OVERRIDES: Record<string, string> = {
  'c/libcurl':
    'Use libcurl to make secure HTTPS calls from C with fine-grained control over headers, payloads, and TLS settings. The following code samples keep things dependency-light while still handling JSON bodies and authentication.',
  'csharp/httpclient':
    'Use the built-in `HttpClient` from .NET to send asynchronous requests without pulling in extra packages. It fits naturally into ASP.NET controllers, Azure Functions, or background services that already rely on the standard library.',
  'csharp/restsharp':
    'Use RestSharp when you prefer a fluent API for serializing payloads and parsing responses. The examples show how to plug DocSpring calls into existing RestSharp-powered integrations.',
  'clojure/clj_http':
    'Use the `clj-http` library to perform DocSpring requests from Clojure. The following code samples highlight idiomatic map-based request bodies and keyword access to JSON responses.',
  'dart/http':
    'Use the `package:http` client to integrate DocSpring calls in Flutter apps, Dart Cloud Functions, or CLIs. The lightweight API keeps async code approachable while still handling headers and JSON payloads.',
  'go/native':
    'Use Go’s `net/http` standard library so you can call DocSpring without third-party dependencies. The following code samples configure request structs, write JSON, and inspect responses using familiar Go patterns.',
  'http/http1.1':
    'Use a raw HTTP/1.1 transcript when you want to share or debug DocSpring requests at the protocol level. It is perfect for quick experiments in tools like `nc`, browser devtools, or API Gateways that accept plain wire payloads.',
  'java/asynchttp':
    'Use AsyncHttpClient for high-throughput Java services that already depend on Netty. The following code samples show how to build requests with futures and plug DocSpring into non-blocking pipelines.',
  'java/nethttp':
    'Use the Java 11 `HttpClient` to keep dependencies minimal while gaining good HTTP/2 defaults. The following code samples demonstrate builder-style configuration, JSON bodies, and response handling using the standard library.',
  'java/okhttp':
    'Use OkHttp when you want a mature, battle-tested HTTP stack for JVM projects. The following code samples outline how to configure the client, post JSON payloads, and capture responses in a fluent way.',
  'java/unirest':
    'Use Unirest if you like a concise chainable API and automatic serialization. It is handy for scripts or lightweight services that already rely on Unirest’s minimal footprint.',
  'js/fetch':
    'Use the built-in Fetch API to make direct HTTP requests to DocSpring. This approach keeps dependencies light—copy the example into your project and drop in your credentials.',
  'js/axios':
    'Use Axios when you prefer a promise-based client with interceptors and automatic JSON parsing. It slots neatly into React, Vue, or Svelte apps that already depend on Axios for API calls.',
  'js/ofetch':
    'Use `ofetch` (from the unjs ecosystem) for a tiny wrapper around Fetch that adds smart defaults like automatic JSON handling. It keeps your bundle small while providing ergonomic helpers.',
  'js/jquery':
    'Use jQuery’s `$.ajax` helper if you are maintaining legacy widgets or dashboards that still ship with jQuery. The snippet shows how to post DocSpring requests without rewriting existing code.',
  'js/xhr':
    'Use `XMLHttpRequest` when you need maximum compatibility with legacy browsers or embedded web views. The following code samples demonstrate manually configuring headers, serializing JSON, and reading responses.',
  'kotlin/okhttp':
    'Use OkHttp in Kotlin to integrate DocSpring with Android apps or backend services. The following code samples embrace Kotlin idioms while building on OkHttp’s robust connection management.',
  'node/fetch':
    'Use the global `fetch` available in modern Node.js versions (or a polyfill) to keep your DocSpring integration dependency-free. The following code samples fit well into serverless handlers and lightweight scripts.',
  'node/axios':
    'Use Axios in Node.js when you want retries, interceptors, or advanced middleware patterns. It mirrors the browser examples so you can share code across full-stack projects.',
  'node/ofetch':
    'Use `ofetch` in Node.js for a lightweight Fetch wrapper with JSON helpers and built-in retry support. It is a great fit for Nitro, Nuxt, and other unjs-based stacks.',
  'node/undici':
    'Use Undici, the modern Node.js HTTP client from the core team, for high-performance DocSpring calls. The following code samples highlight streamlined request builders and response bodies driven by async iterables.',
  'objc/nsurlsession':
    'Use `NSURLSession` to make DocSpring API requests from Objective-C on iOS or macOS. The following code samples configure `NSMutableURLRequest`, write JSON payloads, and parse responses on completion handlers.',
  'ocaml/cohttp':
    'Use Cohttp to make DocSpring API requests from OCaml projects. The following code samples lean on Lwt for async flow and show how to assemble requests using immutable records.',
  'php/curl':
    'Use PHP’s cURL extension for a portable DocSpring integration that runs anywhere PHP does. The following code samples cover setting options, encoding payloads, and decoding JSON responses.',
  'php/guzzle':
    'Use Guzzle when you want PSR-compliant middleware, dependency injection, and richer abstractions. The following code samples show how to configure a reusable client and make DocSpring requests with nice helpers.',
  'powershell/webrequest':
    'Use `Invoke-WebRequest` for quick DocSpring calls from interactive PowerShell sessions or Windows automation scripts. It is ideal for ad-hoc testing and simple workflows.',
  'powershell/restmethod':
    'Use `Invoke-RestMethod` when you want automatic JSON parsing in PowerShell. The following code samples keep your scripts concise while still exposing headers and status handling.',
  'python/python3':
    'Use Python’s `urllib.request` so you can reach DocSpring without third-party packages. It is perfect for Lambda functions or scripts that must stay within a standard library footprint.',
  'python/requests':
    'Use the popular `requests` library for a clean, Pythonic API. The following code samples show how to post JSON, add authentication headers, and handle structured responses.',
  'python/httpx_sync':
    'Use `httpx` in synchronous mode to gain modern features like HTTP/2 and connection pooling while keeping a familiar requests-style API.',
  'python/httpx_async':
    'Use `httpx.AsyncClient` to integrate DocSpring with async frameworks such as FastAPI, Starlette, or Trio. The following code samples highlight awaitable request/response handling.',
  'r/httr':
    'Use the `httr` package when you need tidyverse-friendly helpers for DocSpring calls. The following code samples demonstrate building requests with `httr::POST` and parsing JSON into R data structures.',
  'ruby/native':
    'Use Ruby’s `Net::HTTP` standard library to reach DocSpring without extra gems. The following code samples fit well into background jobs, scripts, or Rails initializers.',
  'rust/reqwest':
    'Use Reqwest, the ergonomic HTTP client for Rust, to pair async/await with strong typing. The following code samples walk through building a request, serializing JSON via Serde, and handling results safely.',
  'shell/curl':
    'Use the `curl` CLI to test DocSpring endpoints from any terminal. It is perfect for quick smoke tests, CI scripts, or sharing minimal repro steps with teammates.',
  'shell/wget':
    'Use `wget` when you prefer a simple CLI that ships on many Linux distributions. The following code samples show how to post JSON bodies and capture responses right from the shell.',
  'shell/httpie':
    'Use HTTPie for a human-friendly command-line experience. The following code samples highlight declarative syntax and rich output that makes debugging DocSpring calls pleasant.',
  'swift/nsurlsession':
    'Use `URLSession` in Swift to integrate DocSpring with native Apple platforms. The following code samples lean on `URLRequest`, JSON encoding, and structured response handling inside async code.',
}

const standardEnding =
  'Copy the sample into your project, replace the placeholders with your DocSpring credentials, and you are ready to test.'

const buildClientInfoMarkdown = (client: ClientOption) => {
  const intro = CLIENT_INTRO_OVERRIDES[client.id]
    ? `${CLIENT_INTRO_OVERRIDES[client.id]}\n\n` + standardEnding
    : `Use the ${client.title} client to call DocSpring without installing the official SDK.\n\n` +
      standardEnding

  const heading = `# ${client.title}`
  return [
    heading,
    intro,
    'You’ll see examples of:',
    '',
    ...CLIENT_INFO_BULLETS,
  ].join('\n')
}

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
const featuredClients = computed(
  () => docSpringClients.options.filter((c) => !['custom/js'].includes(c.id)),
  // [...docSpringClients.options],
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

const ClientInfoMessage = defineComponent({
  name: 'ClientInfoMessage',
  props: {
    client: {
      type: Object as PropType<ClientOption>,
      required: true,
    },
  },
  setup(props) {
    const message = computed(() => buildClientInfoMarkdown(props.client))

    return () =>
      h(
        'section',
        {
          class: 'skip-scalar-reset sl-markdown-content',
        },
        [
          h(ScalarMarkdown, {
            textWrap: true,
            value: message.value,
          }),
        ],
      )
  },
})

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
  const walker = windowDoc.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      const v = node.nodeValue || ''
      return v.includes('API_TOKEN_ID') || v.includes('API_TOKEN_SECRET')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  } as any)

  const textNodes: Text[] = []
  for (let n = walker.nextNode(); n; n = walker.nextNode())
    textNodes.push(n as Text)

  textNodes.forEach((textNode: Text) => {
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
              class="client-link-cards instruction-content instruction-html"
              v-html="processedInstallationHtml" />
            <div
              v-if="installationInstructions.description"
              class="instruction-content"
              :class="installationInstructions.source && 'has-source'">
              <ScalarMarkdown
                textWrap
                :replaceAndMaskCredentials="markdownReplaceAndMask"
                :value="processedInstallationDescription" />

              <StarlightCard
                classNames="mt-6 mb-0"
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
            <div class="instruction-content">
              <ClientInfoMessage :client="client" />
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
            class="client-link-cards instruction-content instruction-html"
            v-html="processedInstallationHtml" />
          <div
            v-if="installationInstructions.description"
            class="instruction-content"
            :class="installationInstructions.source && 'has-source'">
            <ScalarMarkdown
              textWrap
              :replaceAndMaskCredentials="markdownReplaceAndMask"
              :value="processedInstallationDescription" />

            <StarlightCard
              classNames="mt-6 mb-0"
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
          <div class="instruction-content">
            <ClientInfoMessage
              v-if="selectedClientOption"
              :client="selectedClientOption" />
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
  padding-bottom: 36px;
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
