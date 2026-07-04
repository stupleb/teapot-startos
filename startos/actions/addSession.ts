import { Session, sessionsJsonl } from '../fileModels/sessions.jsonl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  username: Value.text({
    name: i18n('Username'),
    description: i18n(
      'The Twitter/X username the session belongs to (without the @). Adding the same username again replaces its stored tokens.',
    ),
    required: true,
    default: null,
    placeholder: 'alice',
  }),
  authToken: Value.text({
    name: 'auth_token',
    description: i18n(
      'The value of the "auth_token" cookie from a logged-in Twitter/X browser session.',
    ),
    required: true,
    default: null,
    masked: true,
  }),
  ct0: Value.text({
    name: 'ct0',
    description: i18n(
      'The value of the "ct0" cookie from the same browser session.',
    ),
    required: true,
    default: null,
    masked: true,
  }),
})

// teapot can only talk to the Twitter/X API with cookies from a logged-in
// account. Sessions are stored directly in sessions.jsonl (upstream's format);
// main.ts reads that file reactively, so the service restarts to load changes.
export const addSession = sdk.Action.withInput(
  // id
  'add-session',

  // metadata
  async ({ effects }) => ({
    name: i18n('Add Twitter/X Session'),
    description: i18n(
      'Add session cookies from a logged-in Twitter/X account so teapot can fetch content.',
    ),
    warning: i18n(
      'Twitter/X may flag or suspend accounts used for scraping. Use a throwaway account, not one you care about.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // no pre-fill: tokens are secrets, entered fresh each time
  async ({ effects }) => null,

  // execution
  async ({ effects, input }) => {
    const sessions = (await sessionsJsonl.read().once()) || []
    const username = input.username.trim().replace(/^@/, '')
    const existing = sessions.find((s) => s.username === username)
    const nextId = sessions.reduce((max, s) => Math.max(max, s.id), 0) + 1

    const session: Session = {
      id: existing?.id ?? nextId,
      username,
      kind: 'cookie',
      auth_token: input.authToken.trim(),
      ct0: input.ct0.trim(),
    }

    await sessionsJsonl.write(effects, [
      ...sessions.filter((s) => s.username !== username),
      session,
    ])

    return {
      version: '1',
      title: i18n('Session Added'),
      message: i18n('The session was saved. The service restarts to load it.'),
      result: null,
    }
  },
)
