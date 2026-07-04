import { addSession } from '../actions/addSession'
import { sessionsJsonl } from '../fileModels/sessions.jsonl'
import { teapotToml } from '../fileModels/teapot.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { newHmacKey } from '../utils'

// On install: seed teapot.toml with defaults plus a generated hmacKey (teapot
// refuses to start without a ≥32-char non-default secret), create an empty
// sessions file, and point the user at the Add Session action — teapot runs
// without sessions but cannot fetch anything. On later inits: a bare merge
// re-asserts defaults and hardcoded values.
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await teapotToml.merge(effects, { config: { hmacKey: newHmacKey() } })
    await sessionsJsonl.write(effects, [])
    await sdk.action.createOwnTask(effects, addSession, 'important', {
      reason: i18n(
        'Add a Twitter/X session so teapot can fetch content from the API.',
      ),
    })
  } else {
    await teapotToml.merge(effects, {})
  }
})
