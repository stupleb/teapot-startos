import { configureBasicAuth } from '../actions/configureBasicAuth'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Non-blocking install reminder: the user decides on or off; task creation is
// idempotent on its replay key, so it appears once and clears when acted on.
export const taskBasicAuth = sdk.setupOnInit(async (effects) => {
  await sdk.action.createOwnTask(effects, configureBasicAuth, 'important', {
    reason: i18n(
      'Decide whether to protect the teapot web interface with a username and password (Basic Auth).',
    ),
  })
})
