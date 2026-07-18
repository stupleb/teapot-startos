import { writeFile } from 'fs/promises'
import { sessionsJsonl } from './fileModels/sessions.jsonl'
import { storeJson } from './fileModels/store.json'
import { teapotToml } from './fileModels/teapot.toml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  basicAuthUsername,
  configPath,
  getCaddyfile,
  sessionsPath,
  teapotPort,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting teapot!'))

  // Reactive reads: teapot loads its config and sessions once at startup, and
  // the Caddyfile is rendered below — any change restarts the daemons.
  await teapotToml.read().const(effects)
  await sessionsJsonl.read().const(effects)
  const basicAuth = await storeJson.read((s) => s.basicAuth).const(effects)

  // 2.0: SubContainer.of() is lazy and synchronous — it materializes on first
  // use (rootfs/exec), so no await here.
  const teapotSub = sdk.SubContainer.of(
    effects,
    { imageId: 'teapot' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'teapot-sub',
  )

  const caddySub = sdk.SubContainer.of(
    effects,
    { imageId: 'caddy' },
    null,
    'caddy-sub',
  )

  // Write the Caddyfile, bcrypt-hashing the Basic Auth password if enabled
  let auth: { username: string; hash: string } | null = null
  if (basicAuth?.enabled && basicAuth.password) {
    const res = await caddySub.exec([
      'caddy',
      'hash-password',
      '--plaintext',
      basicAuth.password,
    ])
    const hash = res.stdout.toString().trim()
    if (!hash.startsWith('$2'))
      throw new Error(`caddy hash-password failed: ${res.stderr.toString()}`)
    auth = { username: basicAuthUsername, hash }
  }
  await writeFile(`${await caddySub.rootfs}/Caddyfile`, getCaddyfile(auth))

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: teapotSub,
      exec: {
        command: ['teapot'],
        env: {
          TEAPOT_CONF_FILE: configPath,
          TEAPOT_SESSIONS_FILE: sessionsPath,
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, teapotPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: [],
    })
    .addDaemon('caddy', {
      subcontainer: caddySub,
      exec: {
        command: ['caddy', 'run', '--config', '/Caddyfile'],
        env: {
          HOME: '/root',
        },
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('Caddy is ready'),
            errorMessage: i18n('Caddy is not ready'),
          }),
      },
      requires: ['primary'],
    })
})
