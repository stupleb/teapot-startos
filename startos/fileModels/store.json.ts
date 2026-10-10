import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const basicAuthShape = z.looseObject({
  enabled: z.boolean().catch(false),
  password: z.string().nullable().catch(null),
})

const shape = z.looseObject({
  // absent until the user decides whether to enable Basic Auth
  basicAuth: basicAuthShape.optional().catch(undefined),
  primaryUrl: z.string().optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: 'store.json',
  },
  shape,
)
