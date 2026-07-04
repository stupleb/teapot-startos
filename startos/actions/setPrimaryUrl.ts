import { teapotToml } from '../fileModels/teapot.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getNonLocalUrls, serverFromUrl, serverUrl } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const urls = await getNonLocalUrls(effects)

    return {
      name: i18n('URL'),
      values: urls.reduce(
        (obj, url) => ({ ...obj, [url]: url }),
        {} as Record<string, string>,
      ),
      default: '',
    }
  }),
})

// teapot builds absolute links (RSS feed URLs, Discord embed metadata) from
// its configured hostname/scheme. The user picks which of the service's URLs
// those links should use.
export const setPrimaryUrl = sdk.Action.withInput(
  // id
  'set-primary-url',

  // metadata
  async ({ effects }) => ({
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose which of your teapot URLs is used when generating links, such as RSS feed URLs and Discord embeds.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current selection
  async ({ effects }) => {
    const server = await teapotToml.read((c) => c.server).once()
    return {
      url:
        server && server.hostname !== 'localhost'
          ? serverUrl(server)
          : undefined,
    }
  },

  // execution: persist into [server] (the service restarts to apply it)
  async ({ effects, input }) =>
    teapotToml.merge(effects, { server: serverFromUrl(input.url) }),
)
