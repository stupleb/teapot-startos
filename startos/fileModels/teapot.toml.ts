import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { uiPort } from '../utils'

// Model of teapot's TOML config (upstream: config/teapot.example.toml). Keys
// are camelCase — upstream deserializes with serde rename_all = "camelCase".
// StartOS-controlled values are literals; everything else keeps upstream
// defaults. hostname/https/publicPort are rendered from the primary URL (see
// init/syncPrimaryUrl.ts).

const serverShape = z.looseObject({
  address: z.literal('0.0.0.0').catch('0.0.0.0'),
  hostname: z.string().catch('localhost'),
  port: z.literal(uiPort).catch(uiPort),
  publicPort: z.number().int().optional().catch(undefined),
  https: z.boolean().catch(false),
  httpMaxConnections: z.number().int().catch(100),
  staticDir: z.literal('/app/public').catch('/app/public'),
  title: z.string().catch('teapot'),
})

const cacheShape = z.looseObject({
  listMinutes: z.number().int().catch(240),
  maxEntries: z.number().int().catch(50_000),
  rssMinutes: z.number().int().catch(10),
})

const appShape = z.looseObject({
  // Required by upstream: non-default secret, ≥32 chars. Generated on install
  // (see init/seedFiles.ts); teapot refuses to start while empty.
  hmacKey: z.string().catch(''),
  base64Media: z.boolean().catch(false),
  enableRSS: z.boolean().catch(true),
  enableDebug: z.boolean().catch(false),
  debugToken: z.string().catch(''),
  proxy: z.string().catch(''),
  proxyAuth: z.string().catch(''),
  apiProxy: z.string().catch(''),
  disableTid: z.boolean().catch(false),
  maxConcurrentReqs: z.number().int().catch(2),
  kagiToken: z.string().catch(''),
  kagiTokenFile: z.string().catch(''),
})

const preferencesShape = z.looseObject({
  theme: z.string().catch('teapot'),
  replaceReddit: z.string().catch(''),
  replaceTwitter: z.string().catch(''),
  replaceYouTube: z.string().catch(''),
  infiniteScroll: z.boolean().catch(false),
})

const gifTranscodingShape = z.looseObject({
  mode: z.literal('off').catch('off'),
  cacheDir: z.literal('/data/cache/gif').catch('/data/cache/gif'),
  cacheMaxMb: z.number().int().catch(512),
  externalDomain: z.string().catch(''),
})

const shape = z.looseObject({
  server: serverShape.catch(() => serverShape.parse({})),
  cache: cacheShape.catch(() => cacheShape.parse({})),
  config: appShape.catch(() => appShape.parse({})),
  preferences: preferencesShape.catch(() => preferencesShape.parse({})),
  gifTranscoding: gifTranscodingShape.catch(() =>
    gifTranscodingShape.parse({}),
  ),
})

export const teapotToml = FileHelper.toml(
  { base: sdk.volumes.main, subpath: 'teapot.toml' },
  shape,
)

export type TeapotConfig = z.infer<typeof shape>
