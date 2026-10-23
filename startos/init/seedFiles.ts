import { sessionsJsonl } from '../fileModels/sessions.jsonl'
import { teapotToml } from '../fileModels/teapot.toml'
import { sdk } from '../sdk'
import { newSecret } from '../utils'

// On install: seed teapot.toml with defaults plus a generated hmacKey (teapot
// refuses to start without a ≥32-char non-default secret) and create an empty
// sessions file. Every init then merges in StartOS's proxy address and a debug
// token, which also re-asserts defaults and hardcoded values.
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await teapotToml.merge(effects, { config: { hmacKey: newSecret() } })
    await sessionsJsonl.write(effects, [])
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
