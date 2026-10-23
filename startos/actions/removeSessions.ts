import { createHash } from 'crypto'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { Session, sessionsJsonl } from '../fileModels/sessions.jsonl'

const { InputSpec, Value } = sdk

// OAuth sessions, which only a hand edit adds, carry no auth_token
const sessionKey = (s: Session) =>
  createHash('sha256')
    .update(s.auth_token ?? s.oauth_token ?? `id:${s.id}`)
    .digest('hex')
    .slice(0, 16)

export const inputSpec = InputSpec.of({
  sessions: Value.dynamicMultiselect(async ({ effects }) => {
    const sessions = (await sessionsJsonl.read().once()) || []
    return {
      name: i18n('Sessions to remove'),
      description: i18n(
        'Sessions are labeled by username when provided, otherwise by their position in the list.',
      ),
      values: Object.fromEntries(
        sessions.map((s, i) => [
          sessionKey(s),
          s.username
            ? `@${s.username}`
            : i18n('Session ${number}', { number: i + 1 }),
        ]),
      ),
      default: [],
    }
  }),
})

export const removeSessions = sdk.Action.withInput(
  // id
  'remove-sessions',

  // metadata
  async ({ effects }) => ({
    name: i18n('Remove X Account Sessions'),
    description: i18n(
      'Remove stored X account sessions, e.g. after revoking a session or deleting the account.',
    ),
    warning: i18n('teapot cannot fetch any data without at least one session.'),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // no prefill
  async () => ({}),

  // the execution function
  async ({ effects, input }) => {
    const existing = (await sessionsJsonl.read().once()) || []
    const remaining = existing.filter(
      (s) => !input.sessions.includes(sessionKey(s)),
    )
    await sessionsJsonl.write(effects, remaining)

    return {
      version: '1' as const,
      title: i18n('Sessions removed'),
      message:
        remaining.length > 0
          ? i18n('The selected sessions were removed.')
          : i18n(
              'All sessions were removed. Add a new session so teapot can fetch data.',
            ),
      result: null,
    }
  },
)
