<script setup lang="ts">
import { Anchor } from '@scalar/api-reference/components/Anchor'
import {
  SectionContainerAccordion,
  SectionHeader,
  SectionHeaderTag,
} from '@scalar/api-reference/components/Section'
import type { TraversedTag } from '@scalar/api-reference/features/traverse-schema'
import { ScalarMarkdown } from '@scalar/components'

defineProps<{
  tag: TraversedTag
}>()
</script>

<template>
  <SectionContainerAccordion class="tag-section">
    <template #title>
      <SectionHeader class="tag-name">
        <Anchor :id="tag.id">
          <SectionHeaderTag :level="2">
            {{ tag.title }}
          </SectionHeaderTag>
        </Anchor>
      </SectionHeader>
      <ScalarMarkdown
        class="tag-description"
        :value="tag.tag?.description"
        withImages />
    </template>
    <slot />
  </SectionContainerAccordion>
</template>

<style scoped>
.tag-section {
  margin-bottom: 48px;
}
.tag-name {
  text-transform: capitalize;
}
.tag-description {
  padding-bottom: 4px;
  text-align: left;
}
</style>
