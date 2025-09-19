<script setup lang="ts">
import { type OpenAPIV3_1 } from '@scalar/openapi-types'

import StarlightCard from '../../components/StarlightCard.vue'

defineProps<{
  value?: OpenAPIV3_1.ExternalDocumentationObject
}>()
</script>

<template>
  <template v-if="value">
    <StarlightCard
      classNames="w-full mb-3"
      :description="value.description || value.url"
      :href="value.url"
      title="Documentation" />
  </template>
</template>
