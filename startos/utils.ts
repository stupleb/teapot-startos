import { T, utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 8080

// Paths inside the container. The 'main' volume mounts at /data; the daemon is
// pointed at these via the TEAPOT_CONF_FILE / TEAPOT_SESSIONS_FILE env vars.
export const dataDir = '/data'
export const configPath = `${dataDir}/teapot.toml`
export const sessionsPath = `${dataDir}/sessions.jsonl`

// teapot requires config.hmacKey to be a non-default secret of ≥32 chars (it
// signs proxied media URLs with it). Generated once on install; never shown.
export const newHmacKey = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 })

export async function getNonLocalUrls(effects: T.Effects) {
  return sdk.serviceInterface
    .getOwn(effects, 'ui', (i) => i?.addressInfo?.nonLocal.format() || [])
    .const()
}

// Reconstruct the URL teapot uses as its link prefix from the [server]
// section — mirrors upstream's url_prefix computation (port omitted when it
// matches the scheme default).
export function serverUrl(server: {
  hostname: string
  https: boolean
  publicPort?: number
}) {
  const scheme = server.https ? 'https' : 'http'
  const defaultPort = server.https ? 443 : 80
  const port = server.publicPort ?? defaultPort
  return port === defaultPort
    ? `${scheme}://${server.hostname}`
    : `${scheme}://${server.hostname}:${port}`
}

// Decompose a URL into the [server] fields that produce it (see serverUrl).
export function serverFromUrl(url: string) {
  const parsed = new URL(url)
  const https = parsed.protocol === 'https:'
  return {
    hostname: parsed.hostname,
    https,
    publicPort: parsed.port ? Number(parsed.port) : https ? 443 : 80,
  }
}
