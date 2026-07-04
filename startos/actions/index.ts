import { sdk } from '../sdk'
import { addSession } from './addSession'
import { removeSession } from './removeSession'
import { setPrimaryUrl } from './setPrimaryUrl'

export const actions = sdk.Actions.of()
  .addAction(addSession)
  .addAction(removeSession)
  .addAction(setPrimaryUrl)
