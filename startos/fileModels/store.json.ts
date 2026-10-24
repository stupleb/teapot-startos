import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  // unset until the owner chooses in Manage Access
  access: z.enum(['private', 'public']).optional().catch(undefined),
  // cleartext, because StartOS's proxy checks the login against it
  password: z.string().optional().catch(undefined),
  primaryUrl: z.string().optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: 'store.json',
  },
  shape,
)
