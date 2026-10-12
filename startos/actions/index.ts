import { primaryUrl } from '../primaryUrl'
import { sdk } from '../sdk'
import { addSession } from './addSession'
import { configureBasicAuth } from './configureBasicAuth'
import { gifTranscoding } from './gifTranscoding'
import { removeSession } from './removeSession'
import { resetBasicAuthPassword } from './resetBasicAuthPassword'
import { setPreferences } from './setPreferences'

export const actions = sdk.Actions.of()
  .addAction(addSession)
  .addAction(removeSession)
  .addAction(configureBasicAuth)
  .addAction(resetBasicAuthPassword)
  .addAction(primaryUrl.action)
  .addAction(setPreferences)
  .addAction(gifTranscoding)
