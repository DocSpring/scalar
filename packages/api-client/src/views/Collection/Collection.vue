<script setup lang="ts">
import ViewLayout from '@scalar/api-client/components/ViewLayout/ViewLayout.vue'
import ViewLayoutSection from '@scalar/api-client/components/ViewLayout/ViewLayoutSection.vue'
import { PathId } from '@scalar/api-client/router'
import { useActiveEntities } from '@scalar/api-client/store'
import CollectionNavigation from '@scalar/api-client/views/Collection/CollectionNavigation.vue'
import { useScroll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const { activeCollection } = useActiveEntities()
const router = useRouter()

const el = ref<HTMLElement | null>(null)
const { y } = useScroll(el)
const isSticky = computed(() => y.value > 104)

// If collection is called 'Drafts', redirect to the first request
watch(
  activeCollection,
  (collection) => {
    if (collection?.info?.title === 'Drafts') {
      const firstRequest = collection.requests[0]
      router.push({
        name: 'request',
        params: { [PathId.Request]: firstRequest },
      })
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <ViewLayout
    ref="el"
    class="h-fit overflow-auto pb-6 xl:overflow-auto">
    <ViewLayoutSection class="xl:h-fit">
      <CollectionNavigation :isSticky="isSticky" />
      <div class="w-full md:mx-auto md:max-w-[720px]">
        <RouterView />
      </div>
    </ViewLayoutSection>
  </ViewLayout>
</template>
