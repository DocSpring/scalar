<script setup lang="ts">
import ScreenReader from '@scalar/api-reference/components/ScreenReader.vue'
import type { TraversedTag } from '@scalar/api-reference/features/traverse-schema'
import type {
  TraversedOperation,
  TraversedWebhook,
} from '@scalar/api-reference/features/traverse-schema/types'
import {
  ScalarCard,
  ScalarCardHeader,
  ScalarCardSection,
} from '@scalar/components'
import { computed } from 'vue'

import OperationsListItem from './OperationsListItem.vue'

const { tag } = defineProps<{
  tag: TraversedTag
}>()

const operationsAndWebhooks = computed(
  (): (TraversedOperation | TraversedWebhook)[] => {
    return tag.children?.filter(
      (child) => 'operation' in child || 'webhook' in child,
    )
  },
)
</script>

<template>
  <template v-if="tag.children?.length > 0">
    <ScalarCard class="endpoints-card">
      <ScalarCardHeader muted>
        <ScreenReader>{{ tag.title }}</ScreenReader>
        {{ tag.isWebhooks ? 'Webhooks' : 'Operations' }}
      </ScalarCardHeader>
      <ScalarCardSection class="custom-scroll max-h-[60vh]">
        <ul
          :aria-label="`${tag.title} endpoints`"
          class="endpoints">
          <OperationsListItem
            v-for="operationOrWebhook in operationsAndWebhooks"
            :key="operationOrWebhook.id"
            :operation="operationOrWebhook" />
        </ul>
      </ScalarCardSection>
    </ScalarCard>
  </template>
</template>

<style scoped>
.endpoints-card {
  position: sticky;
  top: calc(var(--refs-header-height) + 24px);
  font-size: var(--scalar-font-size-3);
}
.endpoints {
  overflow: auto;
  background: var(--scalar-background-2);
  padding: 10px 12px;
  width: 100%;
}
</style>
