import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { primaryUrl } from './primaryUrl'
import { sdk } from './sdk'
import { basicAuthUsername, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const basicAuth = await storeJson.read((s) => s.basicAuth).const(effects)

  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
    addSsl: {
      auth:
        basicAuth?.enabled && basicAuth.password
          ? {
              type: 'basic',
              credentials: [
                { username: basicAuthUsername, password: basicAuth.password },
              ],
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
