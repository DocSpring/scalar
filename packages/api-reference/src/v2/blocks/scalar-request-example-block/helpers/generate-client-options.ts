import type { ClientOptionGroup } from '@/v2/blocks/scalar-request-example-block/types'
import type { XCodeSample } from '@scalar/openapi-types/schemas/extensions'
import { snippetz, type AvailableClients } from '@scalar/snippetz'
import type { ApiReferenceConfiguration } from '@scalar/types/api-reference'
import { capitalize } from 'vue'

/** Helper to generate an ID for custom code samples */
export const generateCustomId = (example: XCodeSample) => `custom/${example.lang}`

/** DocSpring API Clients that are always shown at the top */
const docSpringClients: ClientOptionGroup = {
  label: 'DocSpring API Clients',
  options: [
    {
      id: 'custom/ruby',
      lang: 'ruby',
      title: 'DocSpring Ruby',
      label: 'DocSpring Ruby',
      targetKey: 'ruby',
      targetTitle: 'Ruby',
      clientKey: 'ruby',
    },
    {
      id: 'custom/python',
      lang: 'python',
      title: 'DocSpring Python',
      label: 'DocSpring Python',
      targetKey: 'python',
      targetTitle: 'Python',
      clientKey: 'python',
    },
    {
      id: 'custom/typescript',
      lang: 'typescript',
      title: 'DocSpring TypeScript',
      label: 'DocSpring TypeScript',
      targetKey: 'typescript',
      targetTitle: 'TypeScript',
      clientKey: 'typescript',
    },
    {
      id: 'custom/js',
      lang: 'js',
      title: 'DocSpring JavaScript',
      label: 'DocSpring JavaScript',
      targetKey: 'js',
      targetTitle: 'JavaScript',
      clientKey: 'js',
    },
    {
      id: 'custom/php',
      lang: 'php',
      title: 'DocSpring PHP',
      label: 'DocSpring PHP',
      targetKey: 'php',
      targetTitle: 'PHP',
      clientKey: 'php',
    },
    {
      id: 'custom/java',
      lang: 'java',
      title: 'DocSpring Java',
      label: 'DocSpring Java',
      targetKey: 'java',
      targetTitle: 'Java',
      clientKey: 'java',
    },
    {
      id: 'custom/csharp',
      lang: 'csharp',
      title: 'DocSpring C#',
      label: 'DocSpring C#',
      targetKey: 'csharp',
      targetTitle: 'C#',
      clientKey: 'csharp',
    },
    {
      id: 'custom/go',
      lang: 'go',
      title: 'DocSpring Go',
      label: 'DocSpring Go',
      targetKey: 'go',
      targetTitle: 'Go',
      clientKey: 'go',
    },
    {
      id: 'custom/elixir',
      lang: 'elixir',
      title: 'DocSpring Elixir',
      label: 'DocSpring Elixir',
      targetKey: 'elixir',
      targetTitle: 'Elixir',
      clientKey: 'elixir',
    },
  ],
}

/**
 * Generates client options for the request example block by filtering and organizing
 * built-in snippets based on the hiddenClients configuration. This function creates
 * a structured list of available client options that can be used to generate code
 * examples for different programming languages and frameworks.
 *
 * The function filters built-in clients based on the hiddenClients parameter and
 * groups them by their category (e.g., JavaScript, Python, etc.). The hiddenClients
 * parameter supports multiple formats:
 * - boolean: true to hide all clients
 * - array: ['fetch', 'axios'] to hide specific clients across all categories
 * - object: { node: true, python: ['requests'] } to hide entire categories or specific clients within categories
 */
export const generateClientOptions = (
  hiddenClients: ApiReferenceConfiguration['hiddenClients'],
): ClientOptionGroup[] => {
  if (hiddenClients === true) {
    return []
  }

  const options = snippetz()
    .clients()
    .flatMap((group) => {
      const options = group.clients.flatMap((plugin) => {
        const id = `${group.key}/${plugin.client}` as AvailableClients[number]

        // Hide specific clients across all categories
        // ex: hiddenClients: ['fetch', 'axios']
        if (Array.isArray(hiddenClients) && hiddenClients.includes(plugin.client)) {
          return []
        }

        if (typeof hiddenClients === 'object' && hiddenClients !== null) {
          const groupConfig = hiddenClients[group.key as keyof typeof hiddenClients]

          // Hide entire category if value is true
          // ex: hiddenClients: { node: true, python: true }
          if (groupConfig === true) {
            return []
          }

          // Hide specific clients within category if value is an array
          // ex: hiddenClients: { node: ['fetch', 'axios'], js: ['fetch'] }
          if (Array.isArray(groupConfig) && groupConfig.includes(plugin.client)) {
            return []
          }
        }

        return {
          id,
          lang: plugin.client === 'curl' ? ('curl' as const) : group.key,
          title: `${capitalize(group.title)} ${plugin.title}`,
          label: plugin.title,
          targetKey: group.key,
          targetTitle: group.title,
          clientKey: plugin.client,
        }
      })

      // If no clients are allowed, skip this group
      if (options.length === 0) {
        return []
      }

      return {
        label: group.title,
        options,
      }
    })

  return options
}

/** Get just the DocSpring clients for use in other components */
export const getDocSpringClients = () => docSpringClients

/** Generate client options with DocSpring clients at the top (for RequestExample) */
export const generateClientOptionsWithDocSpring = (
  hiddenClients: ApiReferenceConfiguration['hiddenClients'],
): ClientOptionGroup[] => {
  const options = generateClientOptions(hiddenClients)
  // Always put DocSpring clients at the top
  return [docSpringClients, ...options]
}
