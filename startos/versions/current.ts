import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:5',
  releaseNotes: {
    en_US: "teapot uses X's current search request, so search keeps working.",
    es_ES:
      'teapot usa la solicitud de búsqueda actual de X, por lo que la búsqueda sigue funcionando.',
    de_DE:
      'teapot verwendet die aktuelle Suchanfrage von X, damit die Suche weiter funktioniert.',
    pl_PL:
      'teapot korzysta z aktualnego zapytania wyszukiwania X, więc wyszukiwanie nadal działa.',
    fr_FR:
      'teapot utilise la requête de recherche actuelle de X, la recherche continue donc de fonctionner.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
