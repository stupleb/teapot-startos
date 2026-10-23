import { sessionsJsonl } from './fileModels/sessions.jsonl'
import { teapotToml } from './fileModels/teapot.toml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { configPath, sessionStatePath, sessionsPath, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting teapot!'))

  // teapot loads its config and sessions once at startup, so any change restarts it
  const toml = await teapotToml.read().const(effects)
  await sessionsJsonl.read().const(effects)

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
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
    .addHealthCheck('sessions', {
      ready: {
        display: i18n('X Account Sessions'),
        fn: async () => {
          const health = await fetch(`http://127.0.0.1:${uiPort}/.health`, {
            headers: { Authorization: `Bearer ${toml?.config.debugToken}` },
          })
            .then((res) => res.json())
            .catch(() => null)
          if (!health?.sessions)
            return {
              result: 'failure' as const,
              message: i18n('teapot did not report its session status'),
            }

          const { total, limited, rejected, available } =
            health.sessions as Record<
              'total' | 'limited' | 'rejected' | 'available',
              number
            >
          if (!total)
            return {
              result: 'failure' as const,
              message: i18n(
                'No X account sessions. Run Add X Account Session.',
              ),
            }
          if (available)
            return {
              result: 'success' as const,
              message: rejected
                ? i18n(
                    '${available} of ${total} sessions usable. X refused ${rejected}; replace their cookies with Add X Account Session.',
                    { available, total, rejected },
                  )
                : i18n('${available} of ${total} sessions usable', {
                    available,
                    total,
                  }),
            }
          if (limited)
            return {
              result: 'loading' as const,
              message: i18n(
                'Every usable session is rate-limited by X. They recover within 15 minutes.',
              ),
            }
          return {
            result: 'failure' as const,
            message: i18n(
              'X refused every session. Add fresh cookies with Add X Account Session.',
            ),
          }
        },
      },
      requires: ['primary'],
    })
})
