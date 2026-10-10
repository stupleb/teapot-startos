import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'teapot',
  title: 'teapot',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/stupleb/teapot-startos',
  upstreamRepo: 'https://github.com/amaanq/teapot',
  marketingUrl: 'https://github.com/amaanq/teapot',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    teapot: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
