<script setup lang="ts">
import { Anchor } from '@scalar/api-reference/components/Anchor'
import { OperationsList } from '@scalar/api-reference/components/OperationsList'
import ScreenReader from '@scalar/api-reference/components/ScreenReader.vue'
import {
  Section,
  SectionColumn,
  SectionColumns,
  SectionContent,
  SectionHeader,
  SectionHeaderTag,
} from '@scalar/api-reference/components/Section'
import { SpecificationExtension } from '@scalar/api-reference/features/specification-extension'
import type { TraversedTag } from '@scalar/api-reference/features/traverse-schema'
import { useConfig } from '@scalar/api-reference/hooks/useConfig'
import { ScalarMarkdown } from '@scalar/components'

const { tag, headerId, isCollapsed } = defineProps<{
  tag: TraversedTag
  headerId?: string
  isCollapsed?: boolean
}>()

const config = useConfig()
</script>
<template>
  <Section
    v-if="tag"
    :id="tag.id"
    :label="tag.title?.toUpperCase()"
    role="none">
    <SectionHeader v-show="!config.isLoading">
      <Anchor :id="tag.id">
        <SectionHeaderTag
          :id="headerId"
          :level="2">
          {{ tag.title }}
          <ScreenReader v-if="isCollapsed"> (Collapsed)</ScreenReader>
        </SectionHeaderTag>
      </Anchor>
    </SectionHeader>
    <SectionContent :loading="config.isLoading">
      <SectionColumns>
        <SectionColumn>
          <ScalarMarkdown
            :clamp="isCollapsed ? '7' : false"
            :value="tag.tag?.description ?? ''"
            withImages />
        </SectionColumn>
        <SectionColumn>
          <OperationsList :tag="tag" />
        </SectionColumn>
      </SectionColumns>
    </SectionContent>
    <SpecificationExtension :value="tag.tag" />
  </Section>
</template>
