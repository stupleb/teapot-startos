export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting teapot!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'X Account Sessions': 4,
  'teapot did not report its session status': 5,
  'No X account sessions. Run Add X Account Session.': 6,
  '${available} of ${total} sessions usable. X refused ${rejected}; replace their cookies with Add X Account Session.': 7,
  '${available} of ${total} sessions usable': 8,
  'Every usable session is rate-limited by X. They recover within 15 minutes.': 9,
  'X refused every session. Add fresh cookies with Add X Account Session.': 10,

  // interfaces.ts
  'Web UI': 11,
  'The web interface of teapot': 12,

  // actions/addSession.ts
  'Must be a hexadecimal cookie value': 13,
  'auth_token cookie': 14,
  'The value of the "auth_token" cookie from a logged-in x.com browser session': 15,
  'ct0 cookie': 16,
  'The value of the "ct0" cookie from the same x.com browser session': 17,
  'Username (optional)': 18,
  'The X username the session belongs to. Only used to label the session for troubleshooting.': 19,
  'Must be a valid X username': 20,
  'Add X Account Session': 21,
  'Add session cookies from a logged-in X (Twitter) account. teapot needs at least one session to fetch data. Use a burner account.': 22,
  'Session added': 23,
  'The session was saved. teapot restarts automatically to load it if the service is running.': 24,

  // actions/removeSessions.ts
  'Sessions to remove': 25,
  'Sessions are labeled by username when provided, otherwise by their position in the list.': 26,
  'Session ${number}': 27,
  'Remove X Account Sessions': 28,
  'Remove stored X account sessions, e.g. after revoking a session or deleting the account.': 29,
  'teapot cannot fetch any data without at least one session.': 30,
  'Sessions removed': 31,
  'The selected sessions were removed.': 32,
  'All sessions were removed. Add a new session so teapot can fetch data.': 33,

  // actions/setPrimaryUrl.ts
  'Set Primary URL': 34,
  URL: 35,

  // init/taskPrimaryUrl.ts
  'Choose which of your teapot URLs is used when generating links, such as RSS feed URLs and Discord embeds.': 36,

  // actions/manageAccess.ts
  Access: 37,
  "- Private: teapot asks for a username and password, in your browser and in RSS readers, and Discord can't show previews of teapot links\n- Public: anyone who can reach one of teapot's addresses can use it, and every page they open is fetched with your X sessions": 38,
  'Private (require login)': 39,
  'Generate a new password': 40,
  'Replace the current password. The old one stops working, including in RSS readers. A password is always generated the first time teapot is made private.': 41,
  Public: 42,
  'Manage Access': 43,
  'Make teapot private, so it asks for a username and password, or public. The username is always "admin".': 44,
  'teapot is public': 45,
  "Anyone who can reach one of teapot's addresses can use it without a login.": 46,
  'Login required': 47,
  'teapot asks for a username and password. Your password has not changed.': 48,
  'Use these credentials when your browser or RSS reader asks for a login. This is the only time the password is shown.': 49,
  Username: 50,
  Password: 51,

  // init/taskAccess.ts
  'Choose whether teapot asks for a username and password. Private is the default.': 52,

  // init/taskSessions.ts
  'teapot requires session cookies from a real X (Twitter) account to fetch data. Add a session to start the service.': 53,

  // actions/setPreferences.ts
  'A hostname, followed by :port if it is not 443': 54,
  Theme: 55,
  'Infinite scrolling': 56,
  'Load more posts as the page is scrolled instead of with a button. Needs JavaScript in the browser.': 57,
  'Replace Twitter/X links': 58,
  'Open links to Twitter/X on this other teapot or Nitter instance. Leave empty to open them on this teapot.': 59,
  'Replace YouTube links': 60,
  'Open YouTube links on this Invidious or Piped instance, which must serve HTTPS. Leave empty to open them on YouTube.': 61,
  'Replace Reddit links': 62,
  'Open Reddit links on this Redlib or Teddit instance, which must serve HTTPS. Leave empty to open them on Reddit.': 63,
  'Set Default Preferences': 64,
  "Choose the theme, infinite scrolling and link replacements visitors get until they change them on teapot's own Preferences page. teapot restarts to apply the change.": 65,

  // actions/gifTranscoding.ts
  'Convert GIFs for Discord': 66,
  "X serves GIFs as MP4 videos. When this is on, teapot converts them to real GIFs for Discord embeds, so Discord plays them inline. Converting uses the server's CPU, and up to 512 MB of converted GIFs are cached.": 67,
  'GIF Transcoding': 68,
  'Turn GIF conversion for Discord embeds on or off. teapot restarts to apply the change.': 69,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
