import type { CommandPaletteEvent } from '@scalar/api-client/components/CommandPalette/TheCommandPalette.vue'
import { createEventBus } from '@scalar/api-client/libs/event-bus'
import type { HotKeyEvent } from '@scalar/api-client/libs/hot-keys'
import type { RequestStatus } from '@scalar/api-client/libs/send-request'

/** Create the store for the api client events */
export function createStoreEvents() {
  return {
    /**
     * Event bus to execute requests, usually triggered by the send button in the address bar
     * OR the keyboard shortcut
     */
    executeRequest: createEventBus<{ requestUid?: string }>(),
    /**
     * Event bus to focus the address bar or send button
     */
    focusAddressBar: createEventBus(),
    /**
     * Event bus to cancel requests, usually triggered by response loading overlay
     */
    cancelRequest: createEventBus(),
    /**
     * Event bus to keep track of when a request is started, stopped, or aborted
     */
    requestStatus: createEventBus<RequestStatus>(),
    /**
     * Event bus for controlling the Command Palette
     *
     * @param commandName - the command name you wish to execute, leave empty for the full palette
     */
    commandPalette: createEventBus<CommandPaletteEvent>(),
    /**
     * Event bus for handling hot keys
     */
    hotKeys: createEventBus<HotKeyEvent>(),
  }
}
