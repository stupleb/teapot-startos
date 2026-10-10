export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting teapot!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of teapot': 5,

  // actions/addSession.ts
  Username: 6,
  'The Twitter/X username the session belongs to (without the @). Adding the same username again replaces its stored tokens.': 7,
  'The value of the "auth_token" cookie from a logged-in Twitter/X browser session.': 8,
  'The value of the "ct0" cookie from the same browser session.': 9,
  'Add Twitter/X Session': 10,
  'Add session cookies from a logged-in Twitter/X account so teapot can fetch content.': 11,
  'Twitter/X may flag or suspend accounts used for scraping. Use a throwaway account, not one you care about.': 12,
  'Session Added': 13,
  'The session was saved. The service restarts to load it.': 14,

  // actions/removeSession.ts
  'Remove Twitter/X Session': 15,
  'Remove a stored Twitter/X session from teapot.': 16,
  'No sessions are stored.': 17,
  'Session Removed': 18,
  'The session was removed. The service restarts to apply the change.': 19,

  // primaryUrl.ts, init/taskSetPrimaryUrl.ts
  URL: 20,
  'Set Primary URL': 21,
  'Choose which of your teapot URLs is used when generating links, such as RSS feed URLs and Discord embeds.': 22,

  // init/seedFiles.ts
  'Add a Twitter/X session so teapot can fetch content from the API.': 23,

  // actions/configureBasicAuth.ts
  'Enable Basic Auth': 27,
  'Require a username and password to access the teapot web interface. Applies to everyone, including RSS readers, and prevents Discord embeds while enabled.': 28,
  'Configure Basic Auth': 29,
  'Protect the teapot web interface with a generated username and password, or turn the protection off.': 30,
  'Basic Auth disabled': 31,
  'The web interface no longer requires a login.': 32,
  'Basic Auth enabled': 33,
  'Use these credentials when prompted for a login.': 34,
  Password: 35,

  // actions/resetBasicAuthPassword.ts
  'Reset Basic Auth Password': 36,
  'Generate a new random password for Basic Auth and display it.': 37,
  'Basic Auth Credentials': 38,

  // init/taskBasicAuth.ts
  'Decide whether to protect the teapot web interface with a username and password (Basic Auth).': 39,

  // main.ts (sessions health check)
  'Twitter/X Sessions': 40,
  'teapot did not report its session status': 41,
  'No Twitter/X sessions. Run Add Twitter/X Session.': 42,
  '${available} of ${total} sessions usable. X refused ${rejected}; replace their cookies with Add Twitter/X Session.': 43,
  '${available} of ${total} sessions usable': 44,
  'Every usable session is rate-limited by X. They recover within 15 minutes.': 45,
  'X refused every session. Add fresh cookies with Add Twitter/X Session.': 46,

  // actions/setPreferences.ts
  'A hostname, followed by :port if it is not 443': 47,
  Theme: 48,
  'Infinite scrolling': 49,
  'Load more posts as the page is scrolled instead of with a button. Needs JavaScript in the browser.': 50,
  'Replace Twitter/X links': 51,
  'Open links to Twitter/X on this other teapot or Nitter instance. Leave empty to open them on this teapot.': 52,
  'Replace YouTube links': 53,
  'Open YouTube links on this Invidious or Piped instance, which must serve HTTPS. Leave empty to open them on YouTube.': 54,
  'Replace Reddit links': 55,
  'Open Reddit links on this Redlib or Teddit instance, which must serve HTTPS. Leave empty to open them on Reddit.': 56,
  'Set Default Preferences': 58,
  "Choose the theme, infinite scrolling and link replacements visitors get until they change them on teapot's own Preferences page. teapot restarts to apply the change.": 59,

  // actions/gifTranscoding.ts
  'Convert GIFs for Discord': 60,
  "X serves GIFs as MP4 videos. When this is on, teapot converts them to real GIFs for Discord embeds, so Discord plays them inline. Converting uses the server's CPU, and up to 512 MB of converted GIFs are cached.": 61,
  'GIF Transcoding': 62,
  'Turn GIF conversion for Discord embeds on or off. teapot restarts to apply the change.': 63,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
