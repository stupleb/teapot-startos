import { IMPOSSIBLE, VersionInfo, z } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// store.json as 0.1.0:6 and earlier wrote it
const legacyStore = z.looseObject({
  basicAuth: z
    .looseObject({
      enabled: z.boolean().catch(false),
      password: z.string().nullable().catch(null),
    })
    .optional()
    .catch(undefined),
  primaryUrl: z.string().optional().catch(undefined),
})

export const current = VersionInfo.of({
  version: '0.1.0:7',
  releaseNotes: {
    en_US: `- Manage Access makes teapot private, behind a username and password, or public, and replaces Configure Basic Auth and Reset Basic Auth Password. A new install asks you to choose, with Private as the default; an existing install keeps its current access and password.
- teapot starts only once it has an X account session, and Remove X Account Sessions removes several at once.`,
    es_ES: `- Gestionar acceso hace que teapot sea privado, protegido con un nombre de usuario y una contraseña, o público, y sustituye a Configurar Basic Auth y Restablecer contraseña de Basic Auth. Una instalación nueva te pide elegir, con Privado como opción predeterminada; una instalación existente conserva su acceso y su contraseña actuales.
- teapot solo se inicia cuando tiene una sesión de cuenta de X, y Eliminar sesiones de cuenta de X elimina varias a la vez.`,
    de_DE: `- „Zugriff verwalten“ macht teapot privat, geschützt durch Benutzername und Passwort, oder öffentlich und ersetzt „Basic Auth konfigurieren“ und „Basic-Auth-Passwort zurücksetzen“. Eine neue Installation fragt dich nach deiner Wahl, mit „Privat“ als Voreinstellung; eine bestehende Installation behält ihren aktuellen Zugriff und ihr Passwort.
- teapot startet erst, wenn es eine X-Konto-Sitzung hat, und „X-Konto-Sitzungen entfernen“ entfernt mehrere auf einmal.`,
    pl_PL: `- „Zarządzaj dostępem” ustawia teapot jako prywatny, chroniony nazwą użytkownika i hasłem, albo publiczny, i zastępuje akcje „Skonfiguruj Basic Auth” i „Zresetuj hasło Basic Auth”. Nowa instalacja prosi o wybór, domyślnie „Prywatny”; istniejąca instalacja zachowuje obecny dostęp i hasło.
- teapot uruchamia się dopiero, gdy ma sesję konta X, a „Usuń sesje konta X” usuwa kilka naraz.`,
    fr_FR: `- « Gérer l'accès » rend teapot privé, protégé par un nom d'utilisateur et un mot de passe, ou public, et remplace « Configurer Basic Auth » et « Réinitialiser le mot de passe Basic Auth ». Une nouvelle installation vous demande de choisir, avec « Privé » par défaut ; une installation existante conserve son accès et son mot de passe actuels.
- teapot ne démarre qu'une fois qu'il dispose d'une session de compte X, et « Supprimer des sessions de compte X » en supprime plusieurs à la fois.`,
  },
  migrations: {
    up: async ({ effects }) => {
      const { basicAuth, primaryUrl } = legacyStore.parse(
        (await storeJson.read().once()) ?? {},
      )
      await storeJson.write(effects, {
        access: basicAuth?.enabled && basicAuth.password ? 'private' : 'public',
        password: basicAuth?.password ?? undefined,
        primaryUrl,
      })
      await sdk.action.clearTask(effects, 'teapot:configure-basic-auth')
    },
    down: IMPOSSIBLE,
  },
})
