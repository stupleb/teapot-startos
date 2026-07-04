import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:0',
  releaseNotes: {
    en_US:
      'Initial release of teapot for StartOS (upstream master @ 636c4bf, 2026-06-12).',
    es_ES:
      'Versión inicial de teapot para StartOS (upstream master @ 636c4bf, 2026-06-12).',
    de_DE:
      'Erste Version von teapot für StartOS (Upstream master @ 636c4bf, 2026-06-12).',
    pl_PL:
      'Pierwsze wydanie teapot dla StartOS (upstream master @ 636c4bf, 2026-06-12).',
    fr_FR:
      'Version initiale de teapot pour StartOS (upstream master @ 636c4bf, 2026-06-12).',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
