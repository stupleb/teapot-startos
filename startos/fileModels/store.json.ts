import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * StartOS-only settings with no upstream config file. Basic Auth is enforced
 * by the bundled Caddy proxy; credentials are kept in plaintext here so the
 * configure/reset actions can re-display them (main.ts bcrypt-hashes the
 * password into the Caddyfile at startup).
 */

const basicAuthShape = z.object({
  enabled: z.boolean().catch(false),
  username: z.string().nullable().catch(null),
  password: z.string().nullable().catch(null),
})

const shape = z.object({
  basicAuth: basicAuthShape.catch(() => basicAuthShape.parse({})),
})

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: 'store.json',
  },
  shape,
)
