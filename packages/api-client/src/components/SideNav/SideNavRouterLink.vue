<script setup lang="ts">
import SideNavLink from '@scalar/api-client/components/SideNav/SideNavLink.vue'
import type { Icon } from '@scalar/components'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

defineProps<{
  icon: Icon
  to: RouteLocationRaw
  active?: boolean
}>()
</script>
<template>
  <SideNavLink
    :is="RouterLink"
    :active="Boolean(active)"
    :icon="icon"
    :to="to">
    <slot />
  </SideNavLink>
</template>
