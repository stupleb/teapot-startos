import { utils } from '@start9labs/start-sdk'

export const uiPort = 8080

// Fixed Basic Auth username; only the password is generated.
export const basicAuthUsername = 'admin'

// Paths inside the container. The 'main' volume mounts at /data; the daemon is
// pointed at these via the TEAPOT_CONF_FILE / TEAPOT_SESSIONS_FILE /
// TEAPOT_SESSION_STATE_FILE env vars.
export const dataDir = '/data'
export const configPath = `${dataDir}/teapot.toml`
export const sessionsPath = `${dataDir}/sessions.jsonl`
export const sessionStatePath = `${dataDir}/session-limits.json`

// teapot requires config.hmacKey to be a non-default secret of ≥32 chars (it
// signs proxied media URLs with it). Generated once on install; never shown.
export const newHmacKey = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 })
