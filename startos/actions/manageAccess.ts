import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { uiUsername } from '../utils'

const { InputSpec, Value, Variants } = sdk

export const inputSpec = InputSpec.of({
  access: Value.union({
    name: i18n('Access'),
    description: i18n(
      "- Private: teapot asks for a username and password, in your browser and in RSS readers, and Discord can't show previews of teapot links\n- Public: anyone who can reach one of teapot's addresses can use it, and every page they open is fetched with your X sessions",
    ),
    default: 'private',
    variants: Variants.of({
      private: {
        name: i18n('Private (require login)'),
        spec: InputSpec.of({
          newPassword: Value.toggle({
            name: i18n('Generate a new password'),
            description: i18n(
              'Replace the current password. The old one stops working, including in RSS readers. A password is always generated the first time teapot is made private.',
            ),
            default: false,
          }),
        }),
      },
      public: { name: i18n('Public'), spec: InputSpec.of({}) },
    }),
  }),
})

export const manageAccess = sdk.Action.withInput(
  // id
  'manage-access',

  // metadata
  async ({ effects }) => ({
    name: i18n('Manage Access'),
    description: i18n(
      'Make teapot private, so it asks for a username and password, or public. The username is always "admin".',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current choice
  async ({ effects }) =>
    (await storeJson.read((s) => s.access).once()) === 'public'
      ? { access: { selection: 'public' as const, value: {} } }
      : {
          access: {
            selection: 'private' as const,
            value: { newPassword: false },
          },
        },

  // the execution function
  async ({ effects, input }) => {
    if (input.access.selection === 'public') {
      await storeJson.merge(effects, { access: 'public' })
      return {
        version: '1' as const,
        title: i18n('teapot is public'),
        message: i18n(
          "Anyone who can reach one of teapot's addresses can use it without a login.",
        ),
        result: null,
      }
    }

    const stored = await storeJson.read((s) => s.password).once()
    if (stored && !input.access.value.newPassword) {
      await storeJson.merge(effects, { access: 'private' })
      return {
        version: '1' as const,
        title: i18n('Login required'),
        message: i18n(
          'teapot asks for a username and password. Your password has not changed.',
        ),
        result: null,
      }
    }

    const password = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    await storeJson.merge(effects, { access: 'private', password })
    return {
      version: '1' as const,
      title: i18n('Login required'),
      message: i18n(
        'Use these credentials when your browser or RSS reader asks for a login. This is the only time the password is shown.',
      ),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: uiUsername,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
