<p align="center">
  <img src="icon.png" alt="teapot Logo" width="21%">
</p>

# teapot on StartOS

> Everything not listed in this document should behave the same as upstream
> teapot. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[teapot](https://github.com/amaanq/teapot) is a Twitter/X frontend written in Rust: no JavaScript, no tracking and no ads, with RSS feeds of user timelines and rich Discord embeds. It reads Twitter/X through the session cookies of a logged-in account.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs two daemons from two images: teapot itself, and a Caddy reverse proxy in front of it that owns the exposed port and enforces the optional Basic Auth.

| Property      | Value                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Images        | `teapot`, compiled from upstream source at a pinned commit by this repo's `Dockerfile` (upstream publishes no image or binaries); `caddy`, the official Caddy image |
| Architectures | x86_64, aarch64                                                                                                                                        |
| Entrypoint    | Custom: both daemons' commands are set in `startos/main.ts`                                                                                            |

| Subcontainer | Image  | Daemon    | Runs                                                                                                                                                       |
| ------------ | ------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `teapot-sub` | teapot | `primary` | `teapot`, with `TEAPOT_CONF_FILE=/data/teapot.toml` and `TEAPOT_SESSIONS_FILE=/data/sessions.jsonl`. Listens on 8081, which nothing outside the service reaches |
| `caddy-sub`  | caddy  | `caddy`   | `caddy run --config /Caddyfile`. Listens on 8080 and reverse-proxies to teapot on `localhost:8081`; starts only once teapot is ready                      |

Attach with `start-cli package attach teapot -n teapot-sub` (or `caddy-sub`). The two share a network namespace, which is how Caddy reaches teapot on `localhost`.

While Basic Auth is on, `main` runs `caddy hash-password` in `caddy-sub` before the daemons start, to bcrypt the password into the Caddyfile. If that fails, the service fails to start with `caddy hash-password failed`.

## Volume and Data Layout

Everything the package and teapot keep is on one volume; the Caddy subcontainer mounts none.

| Volume | Mount Point                     | Holds                                         |
| ------ | ------------------------------- | --------------------------------------------- |
| `main` | `/data`, in `teapot-sub` only   | `teapot.toml`, `sessions.jsonl`, `store.json` |

There is no database: teapot keeps its cache in memory, so it starts empty after every restart. The GIF cache directory the config names, `/data/cache/gif`, stays unused while GIF transcoding is off.

## File Models

The package owns three files on the `main` volume and writes a fourth, the Caddyfile, without a model. Any change to the three files restarts the service: `main` reads all of them reactively, and teapot reads its config and sessions only at startup.

### `teapot.toml`

TOML, at `/data/teapot.toml`, passed to teapot by `TEAPOT_CONF_FILE`. Seeded at install with upstream's defaults and a generated 64-character `config.hmacKey`. Every later init (each boot, update and restore) merges it again with no values: a missing key gets its default and an invalid value is replaced, but no valid value is overwritten and no key is removed.

- **Re-asserted at every init**, so a hand edit reverts: `server.address`, `server.port` (teapot's internal 8081), `server.staticDir`, `gifTranscoding.mode` (`off`) and `gifTranscoding.cacheDir`.
- **Written by Set Primary URL**: `server.hostname`, `server.https` and `server.publicPort`. While `server.hostname` is still `localhost`, init sets all three to the service's `.local` address. A hand edit survives, but if it no longer matches one of the service's addresses, the next init raises the critical Set Primary URL task (see [Tasks](#tasks)).
- **Generated once**: `config.hmacKey`. Nothing regenerates it. If it is deleted, the next merge leaves it empty, and teapot refuses to start with a key that is empty, the upstream placeholder, or shorter than 32 characters. The fix is a new random value of at least 32 characters.
- **The user's**: everything else, including `cache.*`, `preferences.*`, `server.title`, `server.httpMaxConnections` and the rest of `config.*` (`proxy`, `kagiToken`, `maxConcurrentReqs` and so on). They start at upstream's defaults, no action exposes them, and a valid hand edit survives restarts and updates. Setting `config.enableDebug` to `true` also needs a `config.debugToken` of at least 32 characters, or teapot refuses to start.

### `sessions.jsonl`

Upstream's format, one JSON object per line: `id`, `username`, `kind` (`"cookie"`), `auth_token` and `ct0`. At `/data/sessions.jsonl`, passed to teapot by `TEAPOT_SESSIONS_FILE`. Created empty at install, and afterwards written only by Add and Remove Twitter/X Session; no init touches it.

A hand edit survives, with two traps. A line that is not valid JSON is skipped, and disappears the next time an action writes the file. A line that is valid JSON but lacks `id`, `username`, `auth_token` or `ct0` makes the package read the whole file as empty, so the next Add or Remove rewrites it with only that action's result and every other session is lost.

### `store.json`

JSON, at `/data/store.json`: StartOS-side state that teapot never reads. It holds `basicAuth.enabled` and `basicAuth.password`, the password in plaintext so the actions can show it again. It does not exist until Configure Basic Auth first runs, and is written only by that action and Reset Basic Auth Password. Its existence is how init knows Basic Auth has been decided, so deleting it brings the Configure Basic Auth task back. A hand edit survives. Basic Auth is enforced only when `enabled` is `true` **and** a password is set; `enabled: true` with no password serves the web UI without a login.

### The Caddyfile

Neither modelled nor on a volume: `main` writes `/Caddyfile` into `caddy-sub`'s root filesystem at every start, from `store.json`, with the password bcrypt-hashed. A hand edit is lost at the next start, and the file is not backed up; `store.json` holds everything needed to regenerate it.

## Dependencies

None. teapot depends on no other service.

## Network Access and Interfaces

The service exposes one interface, served by Caddy; teapot's own port is reachable only inside the service.

| Interface | ID   | Type | Port | Protocol | Serves                                                                                                                                   |
| --------- | ---- | ---- | ---- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Web UI    | `ui` | `ui` | 8080 | HTTP     | teapot's web app, RSS feeds at `/<username>/rss`, and the endpoints Discord reads for embeds, all through Caddy, which applies Basic Auth when it is on |

teapot builds absolute links (RSS item links, embed metadata) from the primary URL in `teapot.toml`, not from the address a request arrives on, so every reader of a feed gets links to the primary URL. Discord can render embeds only when that URL is publicly reachable.

## Installation and First-Run Flow

There is no setup wizard and nothing generated that the user needs to see; the one required step is adding a Twitter/X session.

At install:

1. `teapot.toml` is seeded with defaults and a generated `hmacKey`, which is never shown, and `sessions.jsonl` is created empty.
2. The Add Twitter/X Session task is raised (important).
3. The primary URL is set to the service's `.local` address, as soon as the service has one.
4. The Configure Basic Auth task is raised (important). Basic Auth starts off.

teapot then starts and serves its UI with no sessions, but every profile and post request fails until one is added. No step depends on another: each action restarts the service and takes effect on the next start.

## Actions

All five actions are user-facing, though Reset Basic Auth Password only while Basic Auth is on. Each one writes a file and so restarts the service, which takes the web UI down briefly.

- **Add Twitter/X Session** (`add-session`) — run at first setup, when an account's cookies have expired or it has been restricted (pages error, timelines come back empty), or to add another account. Writes `sessions.jsonl`: a known username's line is replaced, keeping its `id`, and a new username is appended. A leading `@` is stripped. Safe to repeat: re-adding a username replaces its cookies. The cookies are not checked, so bad ones show up only as failed requests after the restart. More accounts give more headroom: teapot uses one that isn't rate-limited for the request, and moves to another when it is.
- **Remove Twitter/X Session** (`remove-session`) — run to retire an account. Removes that username's line; disabled while no session is stored. Removing the last one leaves teapot unable to fetch anything, and nothing prompts the user to add another.
- **Configure Basic Auth** (`configure-basic-auth`) — run to put a login in front of the web UI or take it off. Turning it on generates a 22-character password the first time and keeps the stored one after that, and returns it with the fixed username `admin`. Turning it off keeps the password, so turning it back on restores the same login. Running it again with Basic Auth on is how to see the current password. While on, it applies to every request: browsers prompt, RSS readers need `https://admin:<password>@<host>/<username>/rss`, and Discord embeds stop working.
- **Reset Basic Auth Password** (`reset-basic-auth-password`) — hidden while Basic Auth is off. Run when the password has leaked or someone should lose access. Generates a new 22-character password and returns it with the username; the old one stops working at the restart, so every RSS reader holding it needs the new one. It also sets Basic Auth on, so running it from the CLI while Basic Auth is off turns it on.
- **Set Primary URL** (`set-primary-url`) — run when links in feeds or embeds point at the wrong address, to give Discord a public URL, or when the critical task asks for it. Offers the service's own non-local addresses (an empty list means the interface has none yet) and writes `server.hostname`, `server.https` and `server.publicPort`. Safe to repeat.

## Tasks

The package raises three tasks, all on teapot's own page. Only the critical one, Set Primary URL, stops the service.

| Task (action)         | Severity  | Raised                                                                                                                                                                                            | Cleared                                                                        | Returns                                                  |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Add Twitter/X Session | important | Once, at install                                                                                                                                                                                  | When Add Twitter/X Session runs                                                | No; removing every session later does not raise it again |
| Configure Basic Auth  | important | At any init while `store.json` does not exist, which is until Basic Auth has been configured                                                                                                      | When Configure Basic Auth runs, either way, and by init once `store.json` exists | Only if `store.json` is deleted                          |
| Set Primary URL       | critical  | When the service's address list is known but does not include the configured primary URL: an address or domain removed, or a backup restored onto a server whose addresses differ. Never while the list is still empty | When Set Primary URL runs, and by init as soon as the URL is among the addresses again | Yes, whenever the URL goes missing again                 |

The Set Primary URL task needs care in support. Raising it stops the service, and StartOS will not start it while the task is active. Clearing it, whether by the action or because the address came back, does not restart the service: it has to be started again.

## Health Checks

One health check is reported. Caddy's readiness is checked too, but nothing waits on it and it is never reported.

| Check         | ID        | Probes                                       | Grace period |
| ------------- | --------- | -------------------------------------------- | ------------ |
| Web Interface | `primary` | teapot listening on its internal port, 8081  | 10 seconds   |

A failure after the grace period means teapot exited or never bound its port. Most often it refused its config at startup: an `hmacKey` that is missing or too short, or `enableDebug` without a long enough `debugToken` (see [File Models](#file-models)). The reason is in the service's logs.

A pass proves less than it looks. The check probes teapot directly, not through Caddy, so it can pass while the web UI is down, for instance when Caddy failed to start. It also passes with no sessions or with expired cookies, when every content request fails.

## Backups and Restore

A backup copies the `main` volume wholesale; nothing is dumped and nothing is excluded.

That covers everything the package keeps: `teapot.toml` with its `hmacKey` and primary URL, `sessions.jsonl` and `store.json`. A backup therefore carries live Twitter/X session cookies and the Basic Auth password. The Caddyfile is not in it; it is regenerated at the first start.

After a restore:

- Sessions keep working as long as Twitter/X has not expired or revoked their cookies; replacing them is Add Twitter/X Session again.
- On a different server, or one whose addresses have changed, the restored primary URL is not among the service's addresses, so the critical Set Primary URL task is raised and the service stays stopped until it runs (see [Tasks](#tasks)).
- Basic Auth comes back as it was, with the same password.
- The Configure Basic Auth task comes back only if the backup has no `store.json`, that is, if Basic Auth was never configured.

## Limitations and Differences

1. **No content without a session.** teapot has no anonymous mode; until an account's cookies are added, every profile and post request fails.
2. **The account is at risk.** Twitter/X may flag or suspend accounts whose cookies are used this way, which is why the Add Twitter/X Session warning recommends a throwaway account.
3. **GIF transcoding is off.** It is pinned off and the image ships no ffmpeg, so editing the config cannot turn it on.
4. **Most of teapot's settings have no StartOS UI.** Cache, preferences, the Kagi summarizer and the rest of `config.*` stay at upstream's defaults unless `teapot.toml` is edited by hand (see [File Models](#file-models)).
5. **Upstream has no releases.** The package builds a pinned upstream commit.
6. **Basic Auth is a StartOS addition.** Upstream has no login. While it is on it applies to every request, so RSS readers need the credentials in the feed URL and Discord embeds stop working, because Discord's crawler cannot log in.
7. **One primary URL serves everyone.** Links in feeds and embeds always use it, whichever address a reader came in on, and Discord embeds need it to be publicly reachable.

---

## Quick Reference for AI Consumers

The package's operable surface in one block; its keys follow the sections above.

```yaml
package_id: teapot
image:
  teapot: built from source by this repo's Dockerfile
  caddy: caddy
architectures: [x86_64, aarch64]
subcontainers: [teapot-sub, caddy-sub]
volumes:
  main: /data
file_models:
  - /data/teapot.toml
  - /data/sessions.jsonl
  - /data/store.json
startos_managed_env_vars:
  - TEAPOT_CONF_FILE
  - TEAPOT_SESSIONS_FILE
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - add-session
  - remove-session
  - configure-basic-auth
  - reset-basic-auth-password
  - set-primary-url
tasks:
  - { action: add-session, severity: important }
  - { action: configure-basic-auth, severity: important }
  - { action: set-primary-url, severity: critical }
health_checks:
  - primary
```
