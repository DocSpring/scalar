<script setup lang="ts">
import { useActiveEntities, useWorkspace } from '@scalar/api-client/store'
import { RequestAuth } from '@scalar/api-client/views/Request/RequestSection/RequestAuth'
import { Lazy } from '@scalar/api-reference/components/Lazy'
import { BaseUrl } from '@scalar/api-reference/features/base-url'
import { useNavState } from '@scalar/api-reference/hooks/useNavState'
import type { ClientOptionGroup } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'
import { ScalarErrorBoundary } from '@scalar/components'
import { getSlugUid } from '@scalar/oas-utils/transforms'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import type { ApiReferenceConfiguration } from '@scalar/types'
import type { WorkspaceStore } from '@scalar/workspace-store/client'
import { computed } from 'vue'

import { ClientLibraries } from '../ClientLibraries'
import IntroductionSection from './IntroductionSection.vue'

const props = defineProps<{
  document: OpenAPIV3_1.Document
  config?: ApiReferenceConfiguration
  clientOptions: ClientOptionGroup[]
  store: WorkspaceStore
}>()

const { config, store } = props

const { collections, securitySchemes, servers } = useWorkspace()
const {
  activeCollection: _activeCollection,
  activeEnvVariables,
  activeEnvironment,
  activeWorkspace,
} = useActiveEntities()

/** Match the collection by slug if provided */
const activeCollection = computed(() => {
  if (config?.slug) {
    const collection = collections[getSlugUid(config.slug)]
    if (collection) {
      return collection
    }
  }
  return _activeCollection.value
})

/** Ensure the server is the one selected in the collection */
const activeServer = computed(() => {
  if (!activeCollection.value) {
    return undefined
  }

  if (activeCollection.value.selectedServerUid) {
    const server = servers[activeCollection.value.selectedServerUid]
    if (server) {
      return server
    }
  }

  return servers[activeCollection.value.servers[0]]
})

const { hash } = useNavState()
</script>
<template>
  <Lazy
    id="introduction-card"
    :isLazy="Boolean(hash) && !hash.startsWith('description')"
    prev>
    <IntroductionSection
      :config="config"
      :document="document">
      <!-- Provide a full custom two-column layout -->
      <template #columns>
        <ScalarErrorBoundary>
          <div class="section-columns custom-intro-columns">
            <!-- Left: Client libraries and instructions -->
            <div class="section-column">
              <ClientLibraries
                v-if="
                  config?.hiddenClients !== true &&
                  clientOptions.length &&
                  store.workspace.activeDocument
                "
                :clientOptions
                :document="store.workspace.activeDocument"
                :selectedClient="store.workspace['x-scalar-default-client']" />
            </div>
            <!-- Right: Server and Authentication (slightly narrower) -->
            <div class="section-column">
              <div
                v-if="activeCollection?.servers?.length"
                class="scalar-reference-intro-server scalar-client text-base leading-normal [--scalar-address-bar-height:0px]">
                <BaseUrl
                  :collection="activeCollection"
                  :server="activeServer" />
              </div>
              <div
                v-if="
                  activeCollection &&
                  activeWorkspace &&
                  Object.keys(securitySchemes ?? {}).length
                "
                class="scalar-reference-intro-auth scalar-client leading-normal">
                <RequestAuth
                  :collection="activeCollection"
                  :envVariables="activeEnvVariables"
                  :environment="activeEnvironment"
                  layout="reference"
                  :persistAuth="config?.persistAuth"
                  :selectedSecuritySchemeUids="
                    activeCollection?.selectedSecuritySchemeUids ?? []
                  "
                  :server="activeServer"
                  title="Authentication"
                  :workspace="activeWorkspace" />
                <slot name="after-auth" />
              </div>
            </div>
          </div>
        </ScalarErrorBoundary>
      </template>
    </IntroductionSection>
  </Lazy>
</template>

<style scoped>
.render-loading {
  height: calc(var(--full-height) - var(--refs-header-height));
  display: flex;
  align-items: center;
  justify-content: center;
}
.introduction-card {
  display: flex;
  flex-direction: column;
}
.introduction-card-item {
  display: flex;
  margin-bottom: 12px;
  flex-direction: column;
  justify-content: start;
}
.introduction-card-item:has(.description) :deep(.server-form-container) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.introduction-card-item :deep(.request-item) {
  border-bottom: 0;
}
.introduction-card-title {
  font-weight: var(--scalar-semibold);
  font-size: var(--scalar-mini);
  color: var(--scalar-color-3);
}
.introduction-card-row {
  gap: 24px;
}
@media (min-width: 600px) {
  .introduction-card-row {
    flex-flow: row wrap;
  }
}
.introduction-card-row > * {
  flex: 1;
}
@media (min-width: 600px) {
  .introduction-card-row > * {
    min-width: min-content;
  }
}
@media (max-width: 600px) {
  .introduction-card-row > * {
    max-width: 100%;
  }
}
@container (max-width: 900px) {
  .introduction-card-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0px;
  }
}
.introduction-card :deep(.security-scheme-label) {
  text-transform: uppercase;
  font-weight: var(--scalar-semibold);
}

.references-classic
  .introduction-card-row
  :deep(.scalar-card:nth-of-type(2) .scalar-card-header) {
  display: none;
}
.references-classic
  .introduction-card-row
  :deep(.scalar-card:nth-of-type(2) .scalar-card-header) {
  display: none;
}
.references-classic
  .introduction-card-row
  :deep(
    .scalar-card:nth-of-type(2)
      .scalar-card-header.scalar-card--borderless
      + .scalar-card-content
  ) {
  margin-top: 0;
}

/* Custom two-column layout sizing: left wider, right slightly narrower */
.custom-intro-columns {
  display: flex;
  gap: 48px;
  margin-top: 3rem;
}
.custom-intro-columns > .section-column:first-of-type {
  flex: 0 1 64%;
  min-width: 0;
}
.custom-intro-columns > .section-column:last-of-type {
  flex: 0 1 36%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
@container narrow-references-container (max-width: 900px) {
  .custom-intro-columns {
    flex-direction: column;
    gap: 24px;
  }
  .custom-intro-columns > .section-column {
    flex: 1 1 auto;
  }
}
</style>
