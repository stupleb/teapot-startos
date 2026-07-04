import { sessionsJsonl } from '../fileModels/sessions.jsonl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  username: Value.dynamicSelect(async ({ effects }) => {
    const sessions = (await sessionsJsonl.read().const(effects)) || []

    return {
      name: i18n('Username'),
      values: sessions.reduce(
        (obj, s) => ({ ...obj, [s.username]: s.username }),
        {} as Record<string, string>,
      ),
      default: '',
    }
  }),
})

export const removeSession = sdk.Action.withInput(
  // id
  'remove-session',

  // metadata
  async ({ effects }) => ({
    name: i18n('Remove Twitter/X Session'),
    description: i18n('Remove a stored Twitter/X session from teapot.'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: (await sessionsJsonl.read().const(effects))?.length
      ? 'enabled'
      : { disabled: i18n('No sessions are stored.') },
  }),

  // form input specification
  inputSpec,

  // no pre-fill
  async ({ effects }) => null,

  // execution
  async ({ effects, input }) => {
    const sessions = (await sessionsJsonl.read().once()) || []
    await sessionsJsonl.write(
      effects,
      sessions.filter((s) => s.username !== input.username),
    )

    return {
      version: '1',
      title: i18n('Session Removed'),
      message: i18n(
        'The session was removed. The service restarts to apply the change.',
      ),
      result: null,
    }
  },
)
