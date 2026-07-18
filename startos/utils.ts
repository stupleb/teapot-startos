import { T, utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

// Caddy fronts teapot and owns the exposed UI port (Basic Auth enforcement);
// teapot stays internal.
export const uiPort = 8080
export const teapotPort = 8081

// Fixed Basic Auth username; only the password is generated.
export const basicAuthUsername = 'admin'

// Paths inside the container. The 'main' volume mounts at /data; the daemon is
// pointed at these via the TEAPOT_CONF_FILE / TEAPOT_SESSIONS_FILE env vars.
export const dataDir = '/data'
export const configPath = `${dataDir}/teapot.toml`
export const sessionsPath = `${dataDir}/sessions.jsonl`

// teapot requires config.hmacKey to be a non-default secret of ≥32 chars (it
// signs proxied media URLs with it). Generated once on install; never shown.
export const newHmacKey = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 })

export async function getNonLocalUrls(effects: T.Effects): Promise<string[]> {
  // 2.0: interfaces are reached through their host. Walk the 'ui-multi' host
  // (the MultiHost id from interfaces.ts) to the 'ui' interface; its
  // addressInfo comes back pre-filled with the filter/format helpers.
  return sdk.host
    .getOwn(effects, 'ui-multi', (host) => {
      const ui = Object.values(host?.bindings ?? {})
        .flatMap((b) => Object.values(b.interfaces))
        .find((i) => i.id === 'ui')
      return ui?.addressInfo.nonLocal.format() ?? []
    })
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

export function getCaddyfile(
  basicAuth: { username: string; hash: string } | null,
): string {
  return `
{
	admin off
	log {
		output stdout
		level INFO
	}
}

:${uiPort} {
${
  basicAuth
    ? `	basic_auth {
		${basicAuth.username} ${basicAuth.hash}
	}
`
    : ''
}	reverse_proxy localhost:${teapotPort}
}
`.trim()
}
