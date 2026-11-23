import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:8',
  releaseNotes: {
    en_US: 'Fixes memory use growing while the service runs.',
    es_ES:
      'Corrige el aumento del uso de memoria mientras el servicio está en ejecución.',
    de_DE:
      'Behebt einen während der Laufzeit des Dienstes ansteigenden Speicherverbrauch.',
    pl_PL: 'Naprawia wzrost zużycia pamięci podczas działania usługi.',
    fr_FR:
      "Corrige l'augmentation de la consommation de mémoire pendant le fonctionnement du service.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
