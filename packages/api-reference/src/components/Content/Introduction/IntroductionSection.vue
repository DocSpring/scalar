<script setup lang="ts">
import { Badge } from '@scalar/api-reference/components/Badge'
import { LinkList } from '@scalar/api-reference/components/LinkList'
import {
  Section,
  SectionColumn,
  SectionColumns,
  SectionContainer,
  SectionContent,
  SectionHeader,
  SectionHeaderTag,
} from '@scalar/api-reference/components/Section'
import {
  DownloadLink,
  OPENAPI_VERSION_SYMBOL,
} from '@scalar/api-reference/features/download-link'
import { ExternalDocs } from '@scalar/api-reference/features/external-docs'
import {
  Contact,
  License,
  TermsOfService,
} from '@scalar/api-reference/features/info-object'
import { SpecificationExtension } from '@scalar/api-reference/features/specification-extension'
import { DEFAULT_INTRODUCTION_SLUG } from '@scalar/api-reference/features/traverse-schema'
import { useNavState } from '@scalar/api-reference/hooks/useNavState'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import type { ApiReferenceConfiguration } from '@scalar/types/api-reference'
import { computed, inject, onMounted, type Ref } from 'vue'

import Description from './Description.vue'

const { document, config } = defineProps<{
  document: OpenAPIV3_1.Document
  config?: ApiReferenceConfiguration
}>()

const { getHeadingId } = useNavState()

/**
 * Get the OpenAPI/Swagger specification version from the API definition.
 */
const oasVersion = inject<Ref<string | undefined>>(OPENAPI_VERSION_SYMBOL)

/** Format the version number to be displayed in the badge */
const version = computed(() => {
  // Prefix the version with “v” if the first character is a number, don't prefix if it's not.
  // Don't output anything when version is not a string.
  return typeof document.info?.version === 'string'
    ? document.info.version.toString().match(/^\d/)
      ? `v${document.info.version}`
      : document.info.version
    : typeof document.info?.version === 'number'
      ? `v${document.info.version}`
      : undefined
})

/** Trigger the onLoaded event when the component is mounted */
onMounted(() => config?.onLoaded?.())
</script>
<template>
  <SectionContainer>
    <!-- If the #after slot is used, we need to add a gap to the section. -->
    <Section
      class="introduction-section z-1 gap-12"
      :id="
        getHeadingId({
          slug: DEFAULT_INTRODUCTION_SLUG,
          depth: 1,
          value: 'Introduction',
        })
      ">
      <SectionContent
        :loading="
          config?.isLoading ??
          (!document?.info?.description && !document?.info?.title)
        ">
        <div class="flex gap-1.5">
          <Badge v-if="version">{{ version }}</Badge>
          <Badge v-if="oasVersion">OAS {{ oasVersion }}</Badge>
        </div>
        <SectionHeader
          :loading="!document.info?.title"
          tight>
          <SectionHeaderTag :level="1">
            {{ document.info?.title }}
          </SectionHeaderTag>
          <!-- Links removed to reduce header gap -->
        </SectionHeader>
        <!-- Full-width content inserted above the two-column layout -->
        <slot name="above-columns" />
        <!-- Intro description and a compact download link above columns -->
        <Description :value="document.info?.description" />
        <div class="links mb4 mt-4">
          <DownloadLink :title="document.info?.title" />
        </div>

        <!-- Allow consumers to fully control the two-column layout -->
        <slot name="columns">
          <SectionColumns>
            <SectionColumn>
              <!-- Default left column left intentionally minimal -->
            </SectionColumn>
            <SectionColumn v-if="$slots.aside">
              <div class="sticky-cards">
                <slot name="aside" />
              </div>
            </SectionColumn>
          </SectionColumns>
        </slot>
        <SpecificationExtension :value="document" />
        <SpecificationExtension :value="document.info" />
      </SectionContent>
      <slot name="after" />
    </Section>
  </SectionContainer>
</template>
<style scoped>
.sticky-cards {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: calc(var(--refs-header-height) + 24px);
}
</style>
