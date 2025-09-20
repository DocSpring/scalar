<script setup lang="ts">
import { useActiveEntities, useWorkspace } from '@scalar/api-client/store'
import { getCurrentIndex } from '@scalar/api-reference/components/Content/Operations/get-current-index'
import {
  hasLazyLoaded,
  lazyBus,
} from '@scalar/api-reference/components/Lazy/lazyBus'
import { useSidebar } from '@scalar/api-reference/features/sidebar'
import { useNavState } from '@scalar/api-reference/hooks/useNavState'
import type { ClientOptionGroup } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'
import { freezeAtTop } from '@scalar/helpers/dom/freeze-at-top'
import { getSlugUid } from '@scalar/oas-utils/transforms'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import type { ApiReferenceConfiguration } from '@scalar/types'
import type { WorkspaceStore } from '@scalar/workspace-store/client'
import { computed, ref, watch } from 'vue'

import TraversedEntry from './TraversedEntry.vue'

const { document, config } = defineProps<{
  document: OpenAPIV3_1.Document
  config: ApiReferenceConfiguration
  clientOptions: ClientOptionGroup[]
  store: WorkspaceStore
}>()

const emit = defineEmits<{
  allEntriesLoaded: [loaded: true]
}>()

const { collections, servers } = useWorkspace()
const { activeCollection: _activeCollection } = useActiveEntities()

/**
 * Match the collection by slug if provided
 *
 * @deprecated
 **/
const activeCollection = computed(() => {
  if (config?.slug) {
    const collection = collections[getSlugUid(config.slug)]

    if (collection) {
      return collection
    }
  }

  return _activeCollection.value
})

/**
 * Ensure the server is the one selected in the collection
 *
 * @deprecated
 **/
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

const { items } = useSidebar()
const { hash, isIntersectionEnabled } = useNavState()

const pendingLazyIds = ref(new Set<string>())
const freezeCleanup = ref<ReturnType<typeof freezeAtTop> | null>(null)
let releaseTimeout: ReturnType<typeof setTimeout> | null = null

const clearReleaseTimeout = () => {
  if (releaseTimeout) {
    clearTimeout(releaseTimeout)
    releaseTimeout = null
  }
}

const attachFreeze = (targetHash: string | undefined | null) => {
  if (!targetHash) {
    return null
  }
  const cleanup = freezeAtTop(targetHash)
  return cleanup
}

/** Resume scrolling */
const resume = () => {
  clearReleaseTimeout()
  freezeCleanup.value?.()
  freezeCleanup.value = null
  pendingLazyIds.value.clear()
  hasLazyLoaded.value = true
  isIntersectionEnabled.value = true
}

const ensureFreeze = () => {
  if (hasLazyLoaded.value) return
  if (pendingLazyIds.value.size === 0) return
  if (!freezeCleanup.value) {
    freezeCleanup.value = attachFreeze(hash.value)
  }
}

/** The index of the root entry */
const rootIndex = computed(() =>
  getCurrentIndex(hash.value, items.value.entries),
)

// Use the lazybus to handle [un]freezing elements
lazyBus.on(({ loading, loaded, save }) => {
  if (hasLazyLoaded.value) {
    return
  }

  // Track the previous elements that are loading
  if (loading && save) {
    pendingLazyIds.value.add(loading)
    ensureFreeze()
  }

  // Track which elements have loaded
  if (loaded && save) {
    pendingLazyIds.value.delete(loaded)
  }

  // We are empty! Unfreeze the page
  if (pendingLazyIds.value.size === 0) {
    emit('allEntriesLoaded', true)
    clearReleaseTimeout()
    releaseTimeout = setTimeout(() => {
      if (!hasLazyLoaded.value) {
        resume()
      }
    }, 300)
  }
})

// Resume scrolling after 5 seconds as a failsafe
setTimeout(() => {
  if (!hasLazyLoaded.value) {
    resume()
  }
}, 5000)

watch(
  () => hash.value,
  (value) => {
    freezeCleanup.value?.()
    if (hasLazyLoaded.value) {
      freezeCleanup.value = null
      return
    }
    freezeCleanup.value = value ? attachFreeze(value) : null
    pendingLazyIds.value.clear()
    clearReleaseTimeout()
  },
  { immediate: false },
)
</script>

<template>
  <div v-if="items.entries.length && activeCollection">
    <!-- Use recursive component for cleaner rendering -->
    <TraversedEntry
      :entries="items.entries"
      :activeCollection
      :activeServer
      :clientOptions
      :config
      :document
      :rootIndex
      :store />
  </div>
</template>
