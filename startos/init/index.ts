import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { syncPrimaryUrl } from './syncPrimaryUrl'
import { taskBasicAuth } from './taskBasicAuth'
import { taskSetPrimaryUrl } from './taskSetPrimaryUrl'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  dependencies,
  actions,
  taskSetPrimaryUrl,
  syncPrimaryUrl,
  taskBasicAuth,
)

export const uninit = sdk.setupUninit(versionGraph)
