import { teapotToml } from '../fileModels/teapot.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Convert GIFs for Discord'),
    description: i18n(
      "X serves GIFs as MP4 videos. When this is on, teapot converts them to real GIFs for Discord embeds, so Discord plays them inline. Converting uses the server's CPU, and up to 512 MB of converted GIFs are cached.",
    ),
    default: false,
  }),
})

export const gifTranscoding = sdk.Action.withInput(
  // id
  'gif-transcoding',

  // metadata
  async ({ effects }) => ({
    name: i18n('GIF Transcoding'),
    description: i18n(
      'Turn GIF conversion for Discord embeds on or off. teapot restarts to apply the change.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current mode
  async ({ effects }) => ({
    enabled:
      (await teapotToml.read((c) => c.gifTranscoding.mode).once()) === 'local',
  }),

  // execution: teapot.toml's gifTranscoding.mode (the service restarts to apply it)
  async ({ effects, input }) =>
    teapotToml.merge(effects, {
      gifTranscoding: { mode: input.enabled ? 'local' : 'off' },
    }),
)
