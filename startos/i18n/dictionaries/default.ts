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

  // actions/setPrimaryUrl.ts
  URL: 20,
  'Set Primary URL': 21,
  'Choose which of your teapot URLs is used when generating links, such as RSS feed URLs and Discord embeds.': 22,

  // init/seedFiles.ts
  'Add a Twitter/X session so teapot can fetch content from the API.': 23,

  // init/taskSetPrimaryUrl.ts
  'Primary URL removed. Select a new primary URL.': 24,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
