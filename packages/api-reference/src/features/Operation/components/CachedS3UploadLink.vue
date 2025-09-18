<script setup lang="ts">
import { computed } from 'vue'

import StarlightCard from '../../../components/StarlightCard.vue'

const props = defineProps<{
  operation: any
}>()

const showLink = computed(() => {
  return props.operation?.['x-uses-cached-s3-file-upload'] === true
})
</script>

<template>
  <StarlightCard
    v-if="showLink"
    classNames="mt-5 mb-3 sl-link-card-small"
    description="This endpoint requires a file to be uploaded first using a presigned S3 URL."
    href="#tag/custom-files/get/uploads/presign"
    title="Get a presigned S3 URL for direct file upload" />
</template>
