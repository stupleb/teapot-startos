import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { taskSessions } from './taskSessions'
import { syncPrimaryUrl, taskPrimaryUrl } from './taskPrimaryUrl'
import { taskAccess } from './taskAccess'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  actions,
  dependencies,
  taskSessions,
  taskPrimaryUrl,
  syncPrimaryUrl,
  taskAccess,
)

export const uninit = sdk.setupUninit(versionGraph)
