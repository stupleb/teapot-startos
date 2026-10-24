import { primaryUrl } from '../actions/setPrimaryUrl'
import { teapotToml } from '../fileModels/teapot.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskPrimaryUrl = primaryUrl.setupTask('important', {
  reason: i18n(
    'Choose which of your teapot URLs is used when generating links, such as RSS feed URLs and Discord embeds.',
  ),
})

export const syncPrimaryUrl = sdk.setupOnInit(async (effects) => {
  const url = await primaryUrl.bestUsable(effects).const()
  if (!url || !URL.canParse(url)) return
  const { protocol, hostname, host, port } = new URL(url)
  const https = protocol === 'https:'
  await teapotToml.merge(effects, {
    server: {
      // teapot appends no port to a hostname containing ':'
      hostname: hostname.includes(':') ? host : hostname,
      https,
      publicPort: port ? Number(port) : https ? 443 : 80,
    },
  })
})
