import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { basicAuthUsername } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Enable Basic Auth'),
    description: i18n(
      'Require a username and password to access the teapot web interface. Applies to everyone, including RSS readers, and prevents Discord embeds while enabled.',
    ),
    default: false,
  }),
})

export const configureBasicAuth = sdk.Action.withInput(
  // id
  'configure-basic-auth',

  // metadata
  async ({ effects }) => ({
    name: i18n('Configure Basic Auth'),
    description: i18n(
      'Protect the teapot web interface with a generated username and password, or turn the protection off.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current state
  async ({ effects }) => ({
    enabled:
      (await storeJson.read((s) => s.basicAuth?.enabled).once()) || false,
  }),

  // the execution function
  async ({ effects, input }) => {
    if (!input.enabled) {
      // keep stored credentials so re-enabling restores the same login
      await storeJson.merge(effects, { basicAuth: { enabled: false } })
      return {
        version: '1' as const,
        title: i18n('Basic Auth disabled'),
        message: i18n('The web interface no longer requires a login.'),
        result: null,
      }
    }

    const current = await storeJson.read((s) => s.basicAuth).once()
    const password =
      current?.password ||
      utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 22 })
    await storeJson.merge(effects, {
      basicAuth: { enabled: true, password },
    })

    return {
      version: '1' as const,
      title: i18n('Basic Auth enabled'),
      message: i18n('Use these credentials when prompted for a login.'),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: basicAuthUsername,
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
