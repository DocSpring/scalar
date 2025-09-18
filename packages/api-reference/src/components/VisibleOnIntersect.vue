<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const { rootMargin = '800px 0px', once = true } = defineProps<{
  rootMargin?: string
  once?: boolean
}>()

const container = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof window === 'undefined') {
    isVisible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          isVisible.value = true
          if (once && observer && container.value) {
            observer.unobserve(container.value)
          }
          break
        } else if (!once) {
          isVisible.value = false
        }
      }
    },
    { root: null, rootMargin, threshold: 0.01 },
  )
  if (container.value) observer.observe(container.value)
})

onBeforeUnmount(() => {
  if (observer && container.value) observer.unobserve(container.value)
})
</script>

<template>
  <div ref="container">
    <slot v-if="isVisible" />
    <slot
      v-else
      name="placeholder" />
  </div>
</template>

<style scoped>
/* No styles; consumer controls placeholder size */
</style>
