import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:4',
  releaseNotes: {
    en_US:
      "teapot reports whether its Twitter/X sessions are usable, rate-limited or refused by X, and limits each visitor's X requests separately. New actions set the default theme, infinite scroll and link replacements, and turn on GIF conversion so Discord plays GIFs inline.",
    es_ES:
      'teapot indica si sus sesiones de Twitter/X se pueden usar, están limitadas por X o han sido rechazadas, y limita por separado las peticiones a X de cada visitante. Nuevas acciones fijan el tema predeterminado, el desplazamiento infinito y los reemplazos de enlaces, y activan la conversión de GIF para que Discord los reproduzca en línea.',
    de_DE:
      'teapot zeigt an, ob seine Twitter/X-Sitzungen nutzbar, von X ratenbegrenzt oder abgelehnt sind, und begrenzt die X-Anfragen jedes Besuchers einzeln. Neue Aktionen legen das Standard-Theme, das endlose Scrollen und die Link-Ersetzungen fest und schalten die GIF-Umwandlung ein, damit Discord GIFs direkt abspielt.',
    pl_PL:
      'teapot pokazuje, czy jego sesje Twitter/X są dostępne, ograniczone przez X czy odrzucone, i limituje zapytania do X osobno dla każdego odwiedzającego. Nowe akcje ustawiają domyślny motyw, nieskończone przewijanie i zamianę linków oraz włączają konwersję GIF, dzięki której Discord odtwarza GIF-y bezpośrednio.',
    fr_FR:
      'teapot indique si ses sessions Twitter/X sont utilisables, limitées par X ou refusées, et limite séparément les requêtes vers X de chaque visiteur. De nouvelles actions définissent le thème par défaut, le défilement infini et le remplacement des liens, et activent la conversion des GIF pour que Discord les lise directement.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
