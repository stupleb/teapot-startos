import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) =>
    // teapot rebuilds its GIF cache on demand
    sdk.Backups.ofVolumes('main').setOptions({ exclude: ['cache/'] }),
)
