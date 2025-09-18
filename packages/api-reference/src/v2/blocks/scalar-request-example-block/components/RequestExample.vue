<script lang="ts">
export type RequestExampleProps = {
  /**
   * List of all http clients formatted into option groups for the client selector
   */
  clientOptions: ClientOptionGroup[]
  /**
   * Pre-selected client, this will determine which client is initially selected in the dropdown
   *
   * @defaults to shell/curl or a custom sample if one is available
   */
  selectedClient?: AvailableClients[number] | string
  /**
   * Which server from the spec to use for the code example
   */
  selectedServer?: ServerObject | undefined
  /**
   * The selected content type from the requestBody.content, this will determine which examples are available
   * as well as the content type of the code example
   *
   * @defaults to the first content type
   */
  selectedContentType?: string
  /**
   * In case you wish to pre-select an example from the requestBody.content.examples
   */
  selectedExample?: string
  /**
   * The security schemes which are applicable to this operation
   */
  securitySchemes?: SecuritySchemeObject[]
  /**
   * HTTP method of the operation
   */
  method: HttpMethodType
  /**
   * Path of the operation
   */
  path: string
  /**
   * De-referenced OpenAPI Operation object
   */
  operation: Dereference<OperationObject>
  /**
   * If true and there's no example, we will display a small card with the method and path only
   */
  fallback?: boolean
  /**
   * A method to generate the label of the block, should return an html string
   */
  generateLabel?: () => string
}

/**
 * Request Example
 *
 * The core component for rendering a request example block,
 * this component does not have much of its own state but operates on props and custom events
 *
 * @event scalar-update-selected-client - Emitted when the selected client changes
 * @event scalar-update-selected-example - Emitted when the selected example changes
 */
export default {}
</script>

<script setup lang="ts">
import { HttpMethod } from '@scalar/api-reference/components/HttpMethod'
import { findClient } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/helpers/find-client'
import { generateCustomId } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/helpers/generate-client-options'
import { generateCodeSnippet } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/helpers/generate-code-snippet'
import { getSecrets } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/helpers/get-secrets'
import type {
  ClientOption,
  ClientOptionGroup,
} from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'
import { emitCustomEvent } from '@scalar/api-reference/v2/events'
import {
  ScalarButton,
  ScalarCard,
  ScalarCardFooter,
  ScalarCardHeader,
  ScalarCardSection,
  ScalarCodeBlock,
  ScalarCombobox,
  ScalarMarkdown,
} from '@scalar/components'
import { freezeElement } from '@scalar/helpers/dom/freeze-element'
import type { HttpMethod as HttpMethodType } from '@scalar/helpers/http/http-methods'
import { ScalarIconCaretDown } from '@scalar/icons'
import type { XCodeSample } from '@scalar/openapi-types/schemas/extensions'
import { type AvailableClients, type TargetId } from '@scalar/snippetz'
import type { ExampleObject } from '@scalar/workspace-store/schemas/v3.1/strict/example'
import type { OperationObject } from '@scalar/workspace-store/schemas/v3.1/strict/path-operations'
import type { SecuritySchemeObject } from '@scalar/workspace-store/schemas/v3.1/strict/security-scheme'
import type { ServerObject } from '@scalar/workspace-store/schemas/v3.1/strict/server'
import {
  isReference,
  type Dereference,
} from '@scalar/workspace-store/schemas/v3.1/type-guard'
import { computed, ref, useId, watch, type ComponentPublicInstance } from 'vue'

import StarlightCard from '../../../../components/StarlightCard.vue'
import ExamplePicker from './ExamplePicker.vue'

const {
  clientOptions,
  selectedClient,
  selectedServer = { url: '/' },
  selectedContentType,
  selectedExample,
  securitySchemes = [],
  method,
  path,
  operation,
  generateLabel,
} = defineProps<RequestExampleProps>()

defineSlots<{
  header: () => unknown
  footer: () => unknown
}>()

/** Grab the examples for the given content type */
const operationExamples = computed(() => {
  if (isReference(operation.requestBody)) {
    return {}
  }

  const content = operation.requestBody?.content ?? {}
  const contentType = selectedContentType || Object.keys(content)[0]
  const examples = content[contentType]?.examples ?? {}

  return examples
})

/** The currently selected example key */
const selectedExampleKey = ref<string>(
  selectedExample ?? Object.keys(operationExamples.value)[0],
)

/** Grab any custom code samples from the operation */
const customRequestExamples = computed(() => {
  const customCodeKeys = [
    'x-custom-examples',
    'x-codeSamples',
    'x-code-samples',
  ] as const

  return customCodeKeys.flatMap(
    (key) => (operation[key] as XCodeSample[]) ?? [],
  )
})

type ExtendedXCodeSample = XCodeSample & { description?: string }

const selectedCustomDescription = computed<string | undefined>(() => {
  if (!localSelectedClient.value?.id?.startsWith?.('custom')) return undefined
  const sample = (customRequestExamples.value as ExtendedXCodeSample[]).find(
    (example) => generateCustomId(example) === localSelectedClient.value?.id,
  )
  return sample?.description
})

/** Placeholder -> secret mapping for targeted replace+mask in markdown */
const descriptionReplaceAndMask = computed<Record<string, string>>(() => {
  const basic = securitySchemes.find(
    (scheme) => scheme.type === 'http' && scheme.scheme === 'basic',
  ) as any
  const password = basic?.['x-scalar-secret-password'] as string | undefined
  const map: Record<string, string> = {}
  if (password && password.length >= 1) {
    map['API_TOKEN_SECRET'] = password
  }
  return map
})

/** Apply API_TOKEN_ID substitution to the description; keep API_TOKEN_SECRET as a placeholder
 * so ScalarMarkdown can replace+mask it safely.
 */
const processedCustomDescription = computed<string | undefined>(() => {
  const desc = selectedCustomDescription.value
  if (!desc) return undefined

  const basicAuthScheme = securitySchemes.find(
    (scheme) => scheme.type === 'http' && scheme.scheme === 'basic',
  )

  if (!basicAuthScheme) return desc

  const username = (basicAuthScheme as any)['x-scalar-secret-username'] as
    | string
    | undefined
  const password = (basicAuthScheme as any)['x-scalar-secret-password'] as
    | string
    | undefined

  let out = desc
  // Show the token ID openly, but DO NOT replace the secret here –
  // masking happens in <ScalarMarkdown> via replaceAndMaskCredentials.
  if (username) out = out.replace(/API_TOKEN_ID/g, username)
  return out
})

/**
 * Group plugins by target/language to show in a dropdown
 */
const clients = computed(() => {
  // Handle custom code examples from the OpenAPI spec
  if (customRequestExamples.value.length) {
    const customClients = customRequestExamples.value.map((sample) => {
      const id = generateCustomId(sample)
      const label = sample.label || sample.lang || id

      return {
        id,
        lang: (sample.lang as TargetId) || 'plaintext',
        title: label,
        label,
      } as ClientOption // We yolo assert this as the other properties are only needed in the top selector
    })

    // Always show custom examples first, then regular HTTP clients
    return [
      {
        label: 'DocSpring API Clients',
        options: customClients,
      },
      ...clientOptions.filter(
        (group) => group.label !== 'DocSpring API Clients',
      ), // Remove any DocSpring clients from props
    ]
  }

  // If no custom examples, only show regular HTTP clients (no DocSpring clients)
  return clientOptions.filter(
    (group) => group.label !== 'DocSpring API Clients',
  )
})

/** Helper function to find a fallback client when DocSpring client is selected but no code sample exists */
const findFallbackClient = (
  selectedClientId: string | undefined,
): ClientOption => {
  // If it's a custom DocSpring client
  if (selectedClientId?.startsWith('custom/')) {
    // Check if we have a custom code sample for it
    const hasCustomSample = customRequestExamples.value.some(
      (sample) => generateCustomId(sample) === selectedClientId,
    )

    // If we have a custom sample, return the custom client
    if (hasCustomSample) {
      const client = findClient(clients.value, selectedClientId)
      if (client) {
        return client
      }
    }

    // No custom sample exists - extract language and find fallback HTTP client
    const lang = selectedClientId.substring('custom/'.length)

    const fallbackClient = clientOptions
      .flatMap((group) => group.options)
      .find((client) => {
        // Skip DocSpring clients - we only want HTTP clients for fallback
        if (client.id.startsWith('custom/')) {
          return false
        }

        // For JavaScript, prefer js/fetch over node clients
        if (lang === 'js') {
          return (
            client.id === 'js/fetch' ||
            client.targetKey === 'js' ||
            client.targetKey === 'node'
          )
        }
        // For C#, match 'csharp' target
        if (lang === 'csharp') {
          return client.targetKey === 'csharp'
        }
        // For other languages, match exactly
        return client.targetKey === lang
      })

    if (fallbackClient) {
      return fallbackClient
    }
  } else {
    // It's a regular client, find it normally in the filtered clients
    const client = findClient(clients.value, selectedClientId)
    if (client) {
      return client
    }
  }

  // FINAL fallback to shell/curl - this should NEVER be null
  const curlClient = clientOptions
    .flatMap((group) => group.options)
    .find((client) => client.id === 'shell/curl')

  if (curlClient) {
    return curlClient
  }

  // If somehow shell/curl doesn't exist, return the first available client
  const firstClient = clientOptions.flatMap((group) => group.options)[0]
  if (firstClient) {
    return firstClient
  }

  // This should NEVER happen, but if it does, create a minimal curl client
  return {
    id: 'shell/curl',
    lang: 'shell',
    title: 'cURL',
    label: 'cURL',
    targetKey: 'shell',
    targetTitle: 'Shell',
    clientKey: 'curl',
  }
}

/** The locally selected client which would include code samples from this operation only */
const localSelectedClient = ref<ClientOption>(
  findFallbackClient(selectedClient),
)

/** If the globally selected client changes we can update the local one */
watch(
  () => selectedClient,
  (newClient) => {
    localSelectedClient.value = findFallbackClient(newClient)
  },
)

/** Generate the code snippet for the selected example */
const generatedCode = computed<string>(() => {
  try {
    // Only use custom example if it actually exists and has source
    if (localSelectedClient.value?.id.startsWith('custom')) {
      const customExample = customRequestExamples.value.find(
        (example) =>
          generateCustomId(example) === localSelectedClient.value?.id,
      )

      if (customExample && customExample.source) {
        // Replace API_TOKEN_ID and API_TOKEN_SECRET with actual credentials
        let processedSource = customExample.source

        // Find basic auth credentials
        const basicAuthScheme = securitySchemes.find(
          (scheme) => scheme.type === 'http' && scheme.scheme === 'basic',
        )

        if (basicAuthScheme) {
          const username = basicAuthScheme['x-scalar-secret-username']
          const password = basicAuthScheme['x-scalar-secret-password']

          // Only replace if we have actual values, otherwise keep the placeholders
          if (username) {
            processedSource = processedSource.replace(/API_TOKEN_ID/g, username)
          }
          if (password) {
            processedSource = processedSource.replace(
              /API_TOKEN_SECRET/g,
              password,
            )
          }
        }

        return processedSource
      }
    }

    // For all other cases (including fallback clients), generate code snippet
    const selectedExample =
      operationExamples.value[selectedExampleKey.value || '']
    const example =
      (selectedExample as ExampleObject)?.value ?? selectedExample?.summary

    // Use the actual fallback client ID for code generation, not the custom ID
    const clientIdForGeneration = localSelectedClient.value?.id.startsWith(
      'custom/',
    )
      ? findFallbackClient(localSelectedClient.value.id).id
      : localSelectedClient.value?.id

    return generateCodeSnippet({
      clientId: clientIdForGeneration as AvailableClients[number],
      operation,
      method,
      server: selectedServer,
      securitySchemes,
      contentType: selectedContentType,
      path,
      example,
    })
  } catch (error) {
    console.error('[generateSnippet]', error)

    // Final fallback - try shell/curl
    try {
      return generateCodeSnippet({
        clientId: 'shell/curl',
        operation,
        method,
        server: selectedServer,
        securitySchemes,
        contentType: selectedContentType,
        path,
        example: undefined,
      })
    } catch (fallbackError) {
      console.error('[generateSnippet fallback]', fallbackError)
      return ''
    }
  }
})

/**  Block secrets from being shown in the code block */
const secretCredentials = computed(() => getSecrets(securitySchemes))

/** Grab the ref to freeze the ui as the clients change so there's no jump as the size of the dom changes */
const elem = ref<ComponentPublicInstance | null>(null)

/** Set custom example, or update the selected HTTP client globally */
const selectClient = (option: ClientOption) => {
  // We need to freeze the ui to prevent scrolling as the clients change
  if (elem.value) {
    const unfreeze = freezeElement(elem.value.$el)
    setTimeout(() => {
      unfreeze()
    }, 300)
  }
  // Update to the local example
  localSelectedClient.value = option

  // Emit the change for all clients (including custom)
  emitCustomEvent(elem.value?.$el, 'scalar-update-selected-client', option.id)
}

const id = useId()
</script>
<template>
  <ScalarCard
    v-if="generatedCode"
    ref="elem"
    class="request-card dark-mode">
    <!-- Header -->
    <ScalarCardHeader class="pr-2.5">
      <span class="sr-only">Request Example for</span>
      <HttpMethod
        as="span"
        class="request-method"
        :method="method" />
      <span
        v-if="generateLabel"
        v-html="generateLabel()" />
      <slot
        v-else
        name="header" />
      <!-- Client picker -->
      <template
        v-if="clients.length"
        #actions>
        <ScalarCombobox
          class="max-h-80"
          :modelValue="localSelectedClient"
          :options="clients"
          placement="bottom-end"
          teleport
          @update:modelValue="selectClient($event as ClientOption)">
          <ScalarButton
            class="text-c-2 hover:text-c-1 flex h-full w-fit gap-1.5 px-0.5"
            data-testid="client-picker"
            fullWidth
            variant="ghost">
            <span class="text-base font-normal">{{
              localSelectedClient?.title || 'Select Client'
            }}</span>
            <ScalarIconCaretDown
              class="ui-open:rotate-180 mt-0.25 size-3 transition-transform duration-100"
              weight="bold" />
          </ScalarButton>
        </ScalarCombobox>
      </template>
    </ScalarCardHeader>

    <!-- Code snippet -->
    <ScalarCardSection
      class="request-editor-section custom-scroll flex-col p-0">
      <!-- Optional description rendered as markdown above the code -->
      <!-- <div
        v-if="processedCustomDescription"
        class="code-description mt-5 p-3">
        <ScalarMarkdown
          :allowTags="['span']"
          :replaceAndMaskCredentials="descriptionReplaceAndMask"
          :value="processedCustomDescription" />
      </div> -->

      <!-- <div class="flex flex-row gap-2 p-3">
        <StarlightCard
          classNames="flex-1 sl-link-card-small"
          description="Set up the API client"
          href="#client-libraries"
          title="Install DocSpring" />

        <StarlightCard
          v-if="operation.operationId != 'testAuthentication'"
          classNames="flex-1 sl-link-card-small"
          description="Make sure your API token works"
          href="#tag/authentication/get/authentication"
          title="Test Authentication" />
      </div> -->

      <div
        :id="`${id}-example`"
        class="code-snippet">
        <ScalarCodeBlock
          class="bg-b-2 !min-h-full -outline-offset-2"
          :content="generatedCode"
          :hideCredentials="secretCredentials"
          :lang="localSelectedClient?.lang"
          lineNumbers />
      </div>
    </ScalarCardSection>

    <!-- Footer -->
    <ScalarCardFooter
      v-if="Object.keys(operationExamples).length || $slots.footer"
      class="request-card-footer bg-b-3">
      <!-- Example picker -->
      <div
        v-if="Object.keys(operationExamples).length"
        class="request-card-footer-addon">
        <ExamplePicker
          v-model="selectedExampleKey"
          :examples="operationExamples"
          @update:modelValue="
            emitCustomEvent(elem?.$el, 'scalar-update-selected-example', $event)
          " />
      </div>

      <!-- Footer -->
      <slot name="footer" />
    </ScalarCardFooter>
  </ScalarCard>

  <!-- Fallback card with just method and path in the case of no examples -->
  <ScalarCard
    v-else-if="fallback"
    class="request-card dark-mode">
    <ScalarCardSection class="request-card-simple">
      <div class="request-header">
        <HttpMethod
          as="span"
          class="request-method"
          :method="method" />
        <slot name="header" />
      </div>
      <slot name="footer" />
    </ScalarCardSection>
  </ScalarCard>
</template>
<style scoped>
.request-card {
  font-size: var(--scalar-font-size-3);
}
.request-method {
  font-family: var(--scalar-font-code);
  text-transform: uppercase;
  margin-right: 6px;
}
.request-card-footer {
  display: flex;
  justify-content: flex-end;
  padding: 6px;
  flex-shrink: 0;
}
.request-card-footer-addon {
  display: flex;
  align-items: center;

  flex: 1;
  min-width: 0;
}
.request-editor-section {
  display: flex;
  flex: 1;
}
.request-card-simple {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 8px 8px 8px 12px;

  font-size: var(--scalar-small);
}
.code-snippet {
  display: flex;
  flex-direction: column;
  width: 100%;
}
/*.code-description {
  border-bottom: var(--scalar-border-width) solid var(--scalar-border-color);
}*/
</style>
