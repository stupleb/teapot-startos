import { sdk } from '../sdk'
import { addSession } from './addSession'
import { gifTranscoding } from './gifTranscoding'
import { manageAccess } from './manageAccess'
import { removeSessions } from './removeSessions'
import { primaryUrl } from './setPrimaryUrl'
import { setPreferences } from './setPreferences'

export const actions = sdk.Actions.of()
  .addAction(addSession)
  .addAction(removeSessions)
  .addAction(primaryUrl.action)
  .addAction(manageAccess)
  .addAction(setPreferences)
  .addAction(gifTranscoding)
