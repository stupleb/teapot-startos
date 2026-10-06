import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:2',
  releaseNotes: {
    en_US:
      "The Basic Auth prompt stays dismissed once you've made a choice. The Primary URL prompt clears itself when the address is available again.",
    es_ES:
      'El aviso de Basic Auth no vuelve a aparecer una vez que ha elegido. El aviso de URL principal desaparece por sí solo cuando la dirección vuelve a estar disponible.',
    de_DE:
      'Die Basic-Auth-Aufforderung bleibt geschlossen, sobald Sie sich entschieden haben. Die Aufforderung zur primären URL verschwindet von selbst, sobald die Adresse wieder verfügbar ist.',
    pl_PL:
      'Monit Basic Auth nie wraca po dokonaniu wyboru. Monit o głównym adresie URL znika sam, gdy adres jest znów dostępny.',
    fr_FR:
      "L'invite Basic Auth ne réapparaît pas une fois votre choix fait. L'invite de l'URL principale disparaît d'elle-même dès que l'adresse est de nouveau disponible.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
