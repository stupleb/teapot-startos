import { sdk } from '../sdk'
import { addSession } from './addSession'
import { configureBasicAuth } from './configureBasicAuth'
import { removeSession } from './removeSession'
import { resetBasicAuthPassword } from './resetBasicAuthPassword'
import { setPrimaryUrl } from './setPrimaryUrl'

export const actions = sdk.Actions.of()
  .addAction(addSession)
  .addAction(removeSession)
  .addAction(configureBasicAuth)
  .addAction(resetBasicAuthPassword)
  .addAction(setPrimaryUrl)
