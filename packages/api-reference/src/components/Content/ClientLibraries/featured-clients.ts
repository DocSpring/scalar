// import type { AvailableClients } from '@scalar/types/snippetz'
import type {
  ClientOption,
  ClientOptionGroup,
} from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'

/** Hard coded list of default featured clients - DocSpring SDKs */
const FEATURED_CLIENTS = [
  'custom/ruby',
  'custom/python',
  'custom/js',
  'custom/php',
  'custom/java',
  'custom/csharp',
] as const

/** Whether or not a client is in the featured list */
export const isFeaturedClient = (clientId: string | undefined, featuredClients: readonly string[] = FEATURED_CLIENTS) =>
  Boolean(clientId && featuredClients.includes(clientId))

/**
 * Maps featured client IDs to their corresponding ClientOption objects.
 * Returns an array of ClientOption objects that match the featured clients list,
 * maintaining the order of the featured clients.
 */
export const getFeaturedClients = (
  clientOptions: ClientOptionGroup[],
  featuredClients: readonly string[] = FEATURED_CLIENTS,
): ClientOption[] => {
  // Create a map of all available client options for quick lookup
  const clientMap = new Map<string, ClientOption>()

  // Using the map means we only have to loop through once
  for (const group of clientOptions) {
    for (const option of group.options) {
      clientMap.set(option.id, option)
    }
  }

  // Map featured clients to their corresponding options, maintaining order
  return featuredClients.flatMap((clientId) => {
    const client = clientMap.get(clientId)
    return client ?? []
  })
}
