import { sessionsJsonl } from './fileModels/sessions.jsonl'
import { teapotToml } from './fileModels/teapot.toml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { configPath, sessionStatePath, sessionsPath, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting teapot!'))

  // teapot loads its config and sessions once at startup, so any change restarts it
  await teapotToml.read().const(effects)
  await sessionsJsonl.read().const(effects)

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'teapot' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'teapot-sub',
    ),
    exec: {
      command: ['teapot'],
      env: {
        TEAPOT_CONF_FILE: configPath,
        TEAPOT_SESSIONS_FILE: sessionsPath,
        TEAPOT_SESSION_STATE_FILE: sessionStatePath,
      },
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
