import { i18n } from '../i18n'
import { primaryUrl } from '../primaryUrl'

export const taskSetPrimaryUrl = primaryUrl.setupTask('important', {
  reason: i18n(
    'Choose which of your teapot URLs is used when generating links, such as RSS feed URLs and Discord embeds.',
  ),
})
