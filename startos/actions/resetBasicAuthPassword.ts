import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const resetBasicAuthPassword = sdk.Action.withoutInput(
  // id
  'reset-basic-auth-password',

  // metadata (hidden while Basic Auth is off)
  async ({ effects }) => ({
    name: i18n('Reset Basic Auth Password'),
    description: i18n(
      'Generate a new random password for Basic Auth and display it. The service restarts to apply it.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: (await storeJson
      .read((s) => s.basicAuth.enabled)
      .const(effects))
      ? ('enabled' as const)
      : ('hidden' as const),
  }),

  // the execution function
  async ({ effects }) => {
    const current = await storeJson.read((s) => s.basicAuth).once()
    const username =
      current?.username || utils.getDefaultString({ charset: 'a-z', len: 8 })
    const password = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 22,
    })
    await storeJson.merge(effects, {
      basicAuth: { enabled: true, username, password },
    })

    return {
      version: '1' as const,
      title: i18n('Basic Auth Credentials'),
      message: i18n(
        'Use these credentials when prompted for a login. The service restarts to apply changes.',
      ),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: username,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
