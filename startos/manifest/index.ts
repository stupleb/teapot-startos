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
    caddy: {
      source: { dockerTag: 'caddy:2-alpine' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: {
      en_US:
        'teapot requires Twitter/X session tokens to fetch content. You will need a Twitter/X account, ideally a throwaway — accounts used for scraping risk being flagged or suspended.',
      es_ES:
        'teapot requiere tokens de sesión de Twitter/X para obtener contenido. Necesitará una cuenta de Twitter/X, idealmente una desechable: las cuentas usadas para scraping corren el riesgo de ser marcadas o suspendidas.',
      de_DE:
        'teapot benötigt Twitter/X-Sitzungstoken, um Inhalte abzurufen. Sie benötigen ein Twitter/X-Konto, idealerweise ein Wegwerfkonto — zum Scraping verwendete Konten riskieren, markiert oder gesperrt zu werden.',
      pl_PL:
        'teapot wymaga tokenów sesji Twitter/X do pobierania treści. Potrzebne będzie konto Twitter/X, najlepiej jednorazowe — konta używane do scrapingu ryzykują oznaczenie lub zawieszenie.',
      fr_FR:
        "teapot nécessite des jetons de session Twitter/X pour récupérer du contenu. Vous aurez besoin d'un compte Twitter/X, idéalement jetable — les comptes utilisés pour le scraping risquent d'être signalés ou suspendus.",
    },
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
