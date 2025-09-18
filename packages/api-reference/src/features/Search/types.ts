// TODO: Can we use plain OpenAPI types here?
import type { TraversedEntry } from '@scalar/api-reference/features/traverse-schema'
import type { ParameterMap } from '@scalar/api-reference/libs/openapi'

export type EntryType = 'operation' | 'webhook' | 'model' | 'heading' | 'tag'

export type FuseData = {
  type: EntryType
  id?: string
  title: string
  description: string
  href: string
  body?: string | string[] | ParameterMap
  method?: string
  path?: string
  entry: TraversedEntry
}
