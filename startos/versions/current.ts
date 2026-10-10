import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { teapotToml } from '../fileModels/teapot.toml'

export const current = VersionInfo.of({
  version: '0.1.0:3',
  releaseNotes: {
    en_US:
      "Updates teapot to the latest upstream code, with fixes for X's API, a refreshed interface, and a limit on how quickly teapot fetches uncached pages from X. Open UI opens teapot at its primary URL, and if that address goes away, teapot keeps running on another while a task asks you to choose again.",
    es_ES:
      'Actualiza teapot al código más reciente del proyecto original, con correcciones para la API de X, una interfaz renovada y un límite a la rapidez con la que teapot obtiene de X las páginas que no están en caché. «Abrir UI» abre teapot en su URL principal y, si esa dirección deja de estar disponible, teapot sigue funcionando en otra mientras una tarea le pide que elija de nuevo.',
    de_DE:
      'Aktualisiert teapot auf den neuesten Upstream-Code, mit Korrekturen für die API von X, einer überarbeiteten Oberfläche und einer Begrenzung, wie schnell teapot nicht zwischengespeicherte Seiten von X abruft. „UI öffnen“ öffnet teapot unter seiner primären URL; fällt diese Adresse weg, läuft teapot über eine andere weiter, und eine Aufgabe bittet Sie, erneut zu wählen.',
    pl_PL:
      'Aktualizuje teapot do najnowszego kodu projektu źródłowego, z poprawkami dla API X, odświeżonym interfejsem i limitem tempa, w jakim teapot pobiera z X strony, których nie ma w pamięci podręcznej. „Otwórz UI” otwiera teapot pod jego głównym URL, a jeśli ten adres zniknie, teapot działa dalej pod innym, a zadanie prosi o ponowny wybór.',
    fr_FR:
      "Met à jour teapot vers le code amont le plus récent, avec des correctifs pour l'API de X, une interface remaniée et une limite à la vitesse à laquelle teapot récupère depuis X les pages qui ne sont pas en cache. « Ouvrir UI » ouvre teapot sur son URL principale ; si cette adresse disparaît, teapot continue de fonctionner sur une autre pendant qu'une tâche vous demande de choisir à nouveau.",
  },
  migrations: {
    up: async ({ effects }) => {
      const server = await teapotToml.read((c) => c.server).once()
      if (!server || server.hostname === 'localhost') return
      const scheme = server.https ? 'https' : 'http'
      const defaultPort = server.https ? 443 : 80
      const port = server.publicPort ?? defaultPort
      await storeJson.merge(effects, {
        primaryUrl:
          port === defaultPort
            ? `${scheme}://${server.hostname}`
            : `${scheme}://${server.hostname}:${port}`,
      })
    },
    down: IMPOSSIBLE,
  },
})
