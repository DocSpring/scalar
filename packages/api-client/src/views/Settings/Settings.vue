<script setup lang="ts">
import ViewLayout from '@scalar/api-client/components/ViewLayout/ViewLayout.vue'
import ViewLayoutContent from '@scalar/api-client/components/ViewLayout/ViewLayoutContent.vue'
import { ref, type DefineComponent } from 'vue'

import SettingsGeneral from './SettingsGeneral.vue'

type SettingsGroup = {
  component: DefineComponent<any, any, any>
  title: string
}

const settings: Record<string, SettingsGroup> = {
  general: {
    component: SettingsGeneral,
    title: 'general',
  },
}

const activeSetting = ref('general')
</script>
<template>
  <ViewLayout>
    <ViewLayoutContent class="flex-1">
      <component
        :is="settings[activeSetting]!.component"
        v-if="settings[activeSetting]" />
    </ViewLayoutContent>
  </ViewLayout>
</template>
