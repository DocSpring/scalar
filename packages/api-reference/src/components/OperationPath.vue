<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  path: string
  deprecated?: boolean
}>()

const isVariable = (part: string) => part.startsWith('{') && part.endsWith('}')

// Clean the path by removing endpoint_variant query parameter
const cleanPath = computed(() => {
  return props.path.replace(
    /\?endpoint_variant=[^&\s]*(&|$)/,
    (match, ampersand) => {
      // If there's an ampersand after, keep the ? and return the rest
      return ampersand === '&' ? '?' : ''
    },
  )
})

// Split on the path variables
const pathParts = computed<string[]>(() => cleanPath.value.split(/({[^}]+})/))
</script>
<template>
  <span
    class="operation-path"
    :class="{ deprecated: deprecated }">
    <template
      v-for="(part, i) in pathParts"
      :key="i">
      <em v-if="isVariable(part)">{{ part }}</em>
      <template v-else>{{ part }}</template>
    </template>
  </span>
</template>
<style scoped>
.operation-path {
  overflow: hidden;
  word-wrap: break-word;
  font-weight: var(--scalar-semibold);
  line-break: anywhere;
}
.deprecated {
  text-decoration: line-through;
}
</style>
