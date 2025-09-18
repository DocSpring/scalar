<script setup lang="ts">
import { getCurrentIndex } from '@scalar/api-reference/components/Content/Operations/get-current-index'
import { Tag } from '@scalar/api-reference/components/Content/Tags'
import { Lazy } from '@scalar/api-reference/components/Lazy'
import { SectionContainer } from '@scalar/api-reference/components/Section'
import { Operation } from '@scalar/api-reference/features/Operation'
import {
  type TraversedEntry,
  type TraversedOperation,
  type TraversedTag,
} from '@scalar/api-reference/features/traverse-schema'
import type { TraversedWebhook } from '@scalar/api-reference/features/traverse-schema/types'
import { useNavState } from '@scalar/api-reference/hooks/useNavState'
import type { ClientOptionGroup } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'
import type { Collection, Server } from '@scalar/oas-utils/entities/spec'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import type { ApiReferenceConfiguration } from '@scalar/types'
import type { WorkspaceStore } from '@scalar/workspace-store/client'
import { computed } from 'vue'

const {
  level = 0,
  entries,
  rootIndex,
} = defineProps<{
  level?: number
  rootIndex: number
  entries: TraversedEntry[]
  document: OpenAPIV3_1.Document
  config: ApiReferenceConfiguration
  clientOptions: ClientOptionGroup[]
  activeCollection: Collection
  activeServer: Server | undefined
  store: WorkspaceStore
}>()

/**
 * Type guards for different entry types
 */
const isTagGroup = (entry: TraversedEntry): entry is TraversedTag =>
  'isGroup' in entry && entry.isGroup

const isTag = (entry: TraversedEntry): entry is TraversedTag =>
  'tag' in entry && !isTagGroup(entry)

const isOperation = (entry: TraversedEntry): entry is TraversedOperation =>
  'operation' in entry

const isWebhook = (entry: TraversedEntry): entry is TraversedWebhook =>
  'webhook' in entry

const isWebhookGroup = (entry: TraversedEntry): entry is TraversedTag =>
  'isWebhooks' in entry && Boolean(entry.isWebhooks)

const isRootLevel = computed(() => level === 0)
const { hash } = useNavState()

/** The index of the current entry */
const currentIndex = computed(() => {
  if (isRootLevel.value) {
    return rootIndex
  }

  return getCurrentIndex(hash.value, entries)
})

/**
 * Simple windowed virtualization: only render a slice of entries around the current index.
 * This dramatically reduces DOM and reactive work on large pages.
 */
const WINDOW_BEFORE = 20
const WINDOW_AFTER = 20
const visibleEntries = computed(() => {
  const total = entries.length
  if (total === 0) return entries
  const idx = Math.min(Math.max(currentIndex.value, 0), total - 1)
  const start = Math.max(0, idx - WINDOW_BEFORE)
  const end = Math.min(total, idx + WINDOW_AFTER)
  return entries.slice(start, end)
})

/**
 * Check if the entry should be lazy loaded
 * We care more about the previous entries so we track those
 */
const isLazy = (entry: TraversedEntry) => {
  // Don't be lazy if we are a tag group
  if (isTagGroup(entry)) {
    return null
  }

  // Make all previous entries lazy
  const idx = entries.findIndex((e) => e.id === (entry as any).id)
  if (idx !== -1 && idx < currentIndex.value) {
    return 'prev'
  }

  // We make the next two siblings not lazy
  if (idx !== -1 && idx > currentIndex.value + 2) {
    return 'after'
  }

  return null
}

defineExpose({
  currentIndex,
})
</script>

<template>
  <Lazy
    v-for="entry in visibleEntries"
    :key="entry.id"
    :id="entry.id"
    :prev="isLazy(entry) === 'prev'"
    :isLazy="Boolean(isLazy(entry))">
    <template v-if="isOperation(entry) || isWebhook(entry)">
      <!-- Operation or Webhook -->
      <SectionContainer :omit="!isRootLevel">
        <Operation
          :path="isWebhook(entry) ? entry.name : entry.path"
          :method="entry.method"
          :id="entry.id"
          :document
          :collection="activeCollection"
          :clientOptions
          :layout="config.layout"
          :store
          :server="activeServer"
          :isWebhook="isWebhook(entry)" />
      </SectionContainer>
    </template>

    <!-- Webhook Group or Tag -->
    <template v-else-if="isWebhookGroup(entry) || isTag(entry)">
      <Tag
        :tag="entry"
        :layout="config.layout"
        :moreThanOneTag="entries.filter(isTag).length > 1">
        <template v-if="'children' in entry && entry.children?.length">
          <TraversedEntry
            :level="level + 1"
            :entries="entry.children"
            :activeCollection
            :activeServer
            :clientOptions
            :rootIndex
            :config
            :document
            :store />
        </template>
      </Tag>
    </template>

    <template v-else-if="isTagGroup(entry)">
      <!-- Tag Group -->
      <TraversedEntry
        :level="level + 1"
        :rootIndex
        :entries="entry.children || []"
        :activeCollection
        :activeServer
        :clientOptions
        :config
        :document
        :store />
    </template>
  </Lazy>
</template>
