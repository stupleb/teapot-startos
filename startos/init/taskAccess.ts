import { manageAccess } from '../actions/manageAccess'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskAccess = sdk.setupOnInit(async (effects) => {
  const decided = await storeJson
    .read(
      (s) => s.access === 'public' || (s.access === 'private' && !!s.password),
    )
    .const(effects)
  if (decided) {
    await sdk.action.clearTask(effects, 'teapot:manage-access')
  } else {
    await sdk.action.createOwnTask(effects, manageAccess, 'critical', {
      reason: i18n(
        'Choose whether teapot asks for a username and password. Private is the default.',
      ),
    })
  }
})
