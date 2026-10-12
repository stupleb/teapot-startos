import { teapotToml } from '../fileModels/teapot.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

// upstream's names for the stylesheets in public/css/themes
const themes = [
  'Auto',
  'Auto (twitter)',
  'Black',
  'Dracula',
  'Mastodon',
  'Nord Dark',
  'Nord Light',
  'Pleroma',
  'Teapot',
  'Teapot Light',
  'Twitter',
  'Twitter Dark',
]

const hostField = (name: string, description: string, placeholder: string) =>
  Value.text({
    name,
    description,
    required: false,
    default: null,
    placeholder,
    patterns: [
      {
        regex: '^(https?://)?[^/\\s]+/?$',
        description: i18n('A hostname, followed by :port if it is not 443'),
      },
    ],
  })

export const inputSpec = InputSpec.of({
  theme: Value.select({
    name: i18n('Theme'),
    default: 'Teapot',
    values: Object.fromEntries(themes.map((t) => [t, t])),
  }),
  infiniteScroll: Value.toggle({
    name: i18n('Infinite scrolling'),
    description: i18n(
      'Load more posts as the page is scrolled instead of with a button. Needs JavaScript in the browser.',
    ),
    default: false,
  }),
  replaceTwitter: hostField(
    i18n('Replace Twitter/X links'),
    i18n(
      'Open links to Twitter/X on this other teapot or Nitter instance. Leave empty to open them on this teapot.',
    ),
    'teapot.example.com',
  ),
  replaceYouTube: hostField(
    i18n('Replace YouTube links'),
    i18n(
      'Open YouTube links on this Invidious or Piped instance, which must serve HTTPS. Leave empty to open them on YouTube.',
    ),
    'invidious.example.com',
  ),
  replaceReddit: hostField(
    i18n('Replace Reddit links'),
    i18n(
      'Open Reddit links on this Redlib or Teddit instance, which must serve HTTPS. Leave empty to open them on Reddit.',
    ),
    'redlib.example.com',
  ),
})

// upstream's own mapping from a theme name to its stylesheet
const themeFile = (theme: string) => theme.toLowerCase().replaceAll(' ', '_')

// the field's pattern admits a hostname with an optional scheme and trailing slash
const host = (value: string | null) =>
  (value ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '')

export const setPreferences = sdk.Action.withInput(
  // id
  'set-preferences',

  // metadata
  async ({ effects }) => ({
    name: i18n('Set Default Preferences'),
    description: i18n(
      "Choose the theme, infinite scrolling and link replacements visitors get until they change them on teapot's own Preferences page. teapot restarts to apply the change.",
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current defaults
  async ({ effects }) => {
    const prefs = await teapotToml.read((c) => c.preferences).once()
    return (
      prefs && {
        theme:
          themes.find((t) => themeFile(t) === themeFile(prefs.theme)) ??
          'Teapot',
        infiniteScroll: prefs.infiniteScroll,
        replaceTwitter: prefs.replaceTwitter || null,
        replaceYouTube: prefs.replaceYouTube || null,
        replaceReddit: prefs.replaceReddit || null,
      }
    )
  },

  // execution: teapot.toml's [preferences] (the service restarts to apply it)
  async ({ effects, input }) =>
    teapotToml.merge(effects, {
      preferences: {
        theme: input.theme,
        infiniteScroll: input.infiniteScroll,
        replaceTwitter: host(input.replaceTwitter),
        replaceYouTube: host(input.replaceYouTube),
        replaceReddit: host(input.replaceReddit),
      },
    }),
)
