import { addSession } from '../actions/addSession'
import { sessionsJsonl } from '../fileModels/sessions.jsonl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskSessions = sdk.setupOnInit(async (effects) => {
  const sessions = await sessionsJsonl.read().const(effects)

  if (!sessions?.length) {
    await sdk.action.createOwnTask(effects, addSession, 'critical', {
      reason: i18n(
        'teapot requires session cookies from a real X (Twitter) account to fetch data. Add a session to start the service.',
      ),
    })
  }
})
