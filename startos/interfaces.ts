import { primaryUrl } from './actions/setPrimaryUrl'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort, uiUsername } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const password = await storeJson
    .read((s) => (s.access === 'private' ? s.password : undefined))
    .const(effects)

  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
    addSsl: {
      auth: password
        ? {
            type: 'basic',
            credentials: [{ username: uiUsername, password }],
            realm: null,
          }
        : null,
    },
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n('The web interface of teapot'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
    preferredLauncherAddress: await primaryUrl.bestUsable(effects).const(),
  })

  const uiReceipt = await uiMultiOrigin.export([ui])

  return [uiReceipt]
})
