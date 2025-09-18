<script setup lang="ts">
import CodeInput from '@scalar/api-client/components/CodeInput/CodeInput.vue'
import ViewLayoutSection from '@scalar/api-client/components/ViewLayout/ViewLayoutSection.vue'
import { useWorkspace } from '@scalar/api-client/store'
import { useActiveEntities } from '@scalar/api-client/store/active-entities'

const {
  activeCookieId,
  activeEnvVariables,
  activeEnvironment,
  activeWorkspace,
} = useActiveEntities()
const { cookies } = useWorkspace()
</script>
<template>
  <ViewLayoutSection>
    <template #title>
      <span>Raw Cookie String</span>
    </template>
    <template
      v-if="activeCookieId && cookies[activeCookieId] && activeWorkspace">
      <CodeInput
        class="py-2.5 pr-2 pl-px md:px-2"
        :envVariables="activeEnvVariables"
        :environment="activeEnvironment"
        lineNumbers
        modelValue=""
        :workspace="activeWorkspace" />
    </template>
  </ViewLayoutSection>
</template>
