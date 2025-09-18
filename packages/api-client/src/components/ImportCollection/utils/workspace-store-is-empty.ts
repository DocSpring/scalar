import type { WorkspaceStore } from '@scalar/api-client/store'

/**
 * Checks whether the store is empty.
 */
export function workspaceStoreIsEmpty(store: WorkspaceStore) {
  const hasSingleWorkspace = Object.keys(store.workspaces).length === 1
  const hasSingleCollection = Object.keys(store.collections).length === 1

  return hasSingleWorkspace && hasSingleCollection
}
