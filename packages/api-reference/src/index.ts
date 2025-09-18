export { default as ApiReference } from '@scalar/api-reference/components/ApiReference.vue'
export { default as ApiReferenceLayout } from '@scalar/api-reference/components/ApiReferenceLayout.vue'
export { default as ApiReferenceWorkspace } from '@scalar/api-reference/v2/ApiReferenceWorkspace.vue'
export { SearchButton, SearchModal } from '@scalar/api-reference/features/Search'
// TODO: This component shouldn't live in @scalar/api-reference. If it needs to live in scalar/scalar, it should be in @scalar/api-reference-editor
export { default as GettingStarted } from '@scalar/api-reference/components/GettingStarted.vue'

export { createApiReference } from '@scalar/api-reference/standalone/lib/html-api'

export { useSidebar, Sidebar } from '@scalar/api-reference/features/sidebar'

// TODO: Ideally, we'd remove those exports or at least not export them through the root index.
export { createEmptySpecification } from '@scalar/api-reference/libs/openapi'
export { useNavState } from '@scalar/api-reference/hooks/useNavState'
export type {
  ApiReferenceConfiguration,
  ReferenceProps,
} from '@scalar/api-reference/types'
