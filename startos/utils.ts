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

// For config.hmacKey and config.debugToken, which teapot requires to be at
// least 32 characters. Never shown.
export const newSecret = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 })
