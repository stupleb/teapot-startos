import { configureBasicAuth } from '../actions/configureBasicAuth'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskBasicAuth = sdk.setupOnInit(async (effects) => {
  if (await storeJson.read((s) => s.basicAuth).const(effects)) {
    await sdk.action.clearTask(effects, 'teapot:configure-basic-auth')
  } else {
    await sdk.action.createOwnTask(effects, configureBasicAuth, 'important', {
      reason: i18n(
        'Decide whether to protect the teapot web interface with a username and password (Basic Auth).',
      ),
    })
  }
})
