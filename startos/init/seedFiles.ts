import { addSession } from '../actions/addSession'
import { sessionsJsonl } from '../fileModels/sessions.jsonl'
import { teapotToml } from '../fileModels/teapot.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { newSecret } from '../utils'

// On install: seed teapot.toml with defaults plus a generated hmacKey (teapot
// refuses to start without a ≥32-char non-default secret), create an empty
// sessions file, and point the user at the Add Session action — teapot runs
// without sessions but cannot fetch anything. Every init then merges in
// StartOS's proxy address and a debug token, which also re-asserts defaults
// and hardcoded values.
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await teapotToml.merge(effects, { config: { hmacKey: newSecret() } })
    await sessionsJsonl.write(effects, [])
    await sdk.action.createOwnTask(effects, addSession, 'important', {
      reason: i18n(
        'Add a Twitter/X session so teapot can fetch content from the API.',
      ),
    })
  }
  const debugToken = await teapotToml.read((c) => c.config.debugToken).once()
  await teapotToml.merge(effects, {
    config: {
      // the reverse proxy's address, so teapot bills each visitor separately
      trustedProxies: [await sdk.getOsIp(effects)],
      debugToken:
        debugToken && debugToken.length >= 32 ? debugToken : newSecret(),
    },
  })
})
