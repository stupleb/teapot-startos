import { setPrimaryUrl } from '../actions/setPrimaryUrl'
import { teapotToml } from '../fileModels/teapot.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getNonLocalUrls, serverFromUrl, serverUrl } from '../utils'

// teapot's [server] hostname/https/publicPort drive its absolute-link prefix
// (RSS feeds, embeds). Default to the .local URL on first init; if the chosen
// URL later disappears (e.g. a gateway is removed), prompt for a new one.
export const taskSetPrimaryUrl = sdk.setupOnInit(async (effects) => {
  const availableUrls = await getNonLocalUrls(effects)
  const server = await teapotToml.read((c) => c.server).const(effects)

  if (!server || server.hostname === 'localhost') {
    const fallback = availableUrls.find((u) => u.includes('.local'))
    if (fallback) {
      await teapotToml.merge(
        effects,
        { server: serverFromUrl(fallback) },
        { allowWriteAfterConst: true },
      )
    }
  } else if (!availableUrls.includes(serverUrl(server))) {
    await sdk.action.createOwnTask(effects, setPrimaryUrl, 'critical', {
      reason: i18n('Primary URL removed. Select a new primary URL.'),
    })
  }
})
