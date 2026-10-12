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

The package runs one daemon, teapot itself, from one image.

| Property      | Value                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Image         | `teapot`, compiled from upstream source at a pinned commit by this repo's `Dockerfile` (upstream publishes no image or binaries), plus an ffmpeg built with only what GIF transcoding uses |
| Architectures | x86_64, aarch64                                                                                                                                                                            |
| Entrypoint    | Custom: the daemon's command is set in `startos/main.ts`                                                                                                                                   |

| Subcontainer | Image  | Daemon    | Runs                                                                                                                                                                        |
| ------------ | ------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `teapot-sub` | teapot | `primary` | `teapot`, with `TEAPOT_CONF_FILE=/data/teapot.toml`, `TEAPOT_SESSIONS_FILE=/data/sessions.jsonl` and `TEAPOT_SESSION_STATE_FILE=/data/session-limits.json`. Listens on 8080 |

Attach with `start-cli package attach teapot -n teapot-sub`.

## Volume and Data Layout

Everything the package and teapot keep is on one volume.

| Volume | Mount Point | Holds                                                                |
| ------ | ----------- | -------------------------------------------------------------------- |
| `main` | `/data`     | `teapot.toml`, `sessions.jsonl`, `store.json`, `session-limits.json` |

There is no database: teapot keeps its cache in memory, so it starts empty after every restart. The one cache on disk is `/data/cache/gif`, up to 512 MB of converted GIFs while GIF transcoding is on; backups leave it out.

## File Models

The package owns three files on the `main` volume; teapot writes a fourth, `session-limits.json`, itself. Any change to `teapot.toml` or `sessions.jsonl` restarts the service: `main` reads both reactively, and teapot reads them only at startup. A change to `store.json` restarts nothing by itself: its Basic Auth setting applies at once, and its primary URL reaches teapot through `teapot.toml`.

### `teapot.toml`

TOML, at `/data/teapot.toml`, passed to teapot by `TEAPOT_CONF_FILE`. Seeded at install with upstream's defaults and a generated 64-character `config.hmacKey`. Every init (install, each boot, update and restore) merges it again: a missing key gets its default and an invalid value is replaced, but no key is removed, and only the values below are overwritten.

- **Re-asserted at every init**, so a hand edit reverts: `server.address`, `server.port` (8080), `server.staticDir`, `config.enableDebug` (`true`), `gifTranscoding.cacheDir`, and `config.trustedProxies`, set to StartOS's address on the container bridge, where its reverse proxy connects from. `config.debugToken` is replaced with a new random one when it is missing or shorter than 32 characters. Debug stays on for the Sessions health check (see [Health Checks](#health-checks)).
- **Rendered from the link URL** (see [Network Access and Interfaces](#network-access-and-interfaces)): `server.hostname`, `server.https` and `server.publicPort`, at every init and whenever the link URL changes, so a hand edit reverts. For an IPv6 address, `server.hostname` carries the port as well, because teapot appends none to a hostname containing `:`.
- **Written by actions**: `preferences.*` by Set Default Preferences, and `gifTranscoding.mode` by GIF Transcoding: `off` or `local`, and anything else reverts to `off` at the next init. A hand edit survives until the action runs.
- **Generated once**: `config.hmacKey`. Nothing regenerates it. If it is deleted, the next merge leaves it empty, and teapot refuses to start with a key that is empty, the upstream placeholder, or shorter than 32 characters. The fix is a new random value of at least 32 characters.
- **The user's**: everything else, including `cache.*`, `server.title`, `server.httpMaxConnections`, the rest of `config.*` (`proxy`, `kagiToken`, `maxConcurrentReqs` and so on) and keys the model doesn't declare, such as `config.clientBudget` and `config.xPosedCommunityCache`. They start at upstream's defaults, no action exposes them, and a valid hand edit survives restarts and updates. teapot refuses to start on a zero `server.httpMaxConnections`, `config.maxConcurrentReqs`, `cache.maxEntries`, `cache.listMinutes` or `cache.rssMinutes`.

### `sessions.jsonl`

Upstream's format, one JSON object per line: `id`, `username`, `kind`, and either `auth_token` and `ct0` (`"cookie"`) or `oauth_token` and `oauth_secret` (`"oauth"`, teapot's default). At `/data/sessions.jsonl`, passed to teapot by `TEAPOT_SESSIONS_FILE`. Created empty at install, and afterwards written only by Add and Remove Twitter/X Session; no init touches it. Add Twitter/X Session writes cookie sessions only.

A hand edit survives, OAuth sessions included. A line that is not a JSON object is ignored, as teapot ignores it, and disappears the next time an action writes the file. A line without an `id` or `username` gets teapot's defaults, `0` and an empty name, when an action rewrites the file.

### `store.json`

JSON, at `/data/store.json`: StartOS-side state that teapot never reads. It holds two keys, each absent until its action first runs:

- `basicAuth`: `enabled` and `password`, the password in plaintext so the actions can show it again. Written only by Configure Basic Auth and Reset Basic Auth Password. Its presence is how init knows Basic Auth has been decided, so removing it, or deleting the file, brings the Configure Basic Auth task back. Basic Auth is enforced only when `enabled` is `true` **and** a password is set; `enabled: true` with no password serves the web UI without a login.
- `primaryUrl`: the URL chosen in Set Primary URL. A server updated from a release that kept the primary URL in `teapot.toml` starts with it copied from there.

A hand edit survives and applies at once.

### `session-limits.json`

Not a model: teapot writes it itself, at `/data/session-limits.json` where `TEAPOT_SESSION_STATE_FILE` points it, and reads it back at start, so a restart doesn't forget which sessions are rate-limited. It is rewritten at most every 15 seconds while the limits change. The package never reads or writes it, and a change to it doesn't restart the service. Deleting it only makes teapot relearn the limits.

## Dependencies

None. teapot depends on no other service.

## Network Access and Interfaces

The service exposes one interface. StartOS's reverse proxy serves its HTTPS addresses and, while Basic Auth is on, asks for the login there before a request reaches teapot.

| Interface | ID   | Type | Port | Protocol | Serves                                                                                       |
| --------- | ---- | ---- | ---- | -------- | -------------------------------------------------------------------------------------------- |
| Web UI    | `ui` | `ui` | 8080 | HTTP     | teapot's web app, RSS feeds at `/<username>/rss`, and the endpoints Discord reads for embeds |

teapot builds absolute links (RSS item links, embed metadata) from `server.hostname`, `server.https` and `server.publicPort` in `teapot.toml`, not from the address a request arrives on, so every reader of a feed gets links to the same URL, the link URL. It is the primary URL while that URL's hostname is one of the service's addresses, followed to the hostname's current port and scheme. Until a primary URL is chosen, and while the chosen one is gone, it is the preferred address instead: a public domain, HTTPS first, else the `.local` address, else the first one offered. **Open UI** opens the link URL, unless StartOS can tell the browser could not reach it. Discord can render embeds only when it is publicly reachable.

## Installation and First-Run Flow

There is no setup wizard and nothing generated that the user needs to see; the one required step is adding a Twitter/X session.

At install:

1. `teapot.toml` is seeded with defaults and a generated `hmacKey`, which is never shown, and `sessions.jsonl` is created empty.
2. The Add Twitter/X Session task is raised (important).
3. The Set Primary URL task is raised (important), pre-filled with the preferred address, which teapot links to until a URL is chosen.
4. The Configure Basic Auth task is raised (important). Basic Auth starts off.

teapot then starts and serves its UI with no sessions, but every profile and post request fails until one is added. No step depends on another.

## Actions

All seven actions are user-facing, though Reset Basic Auth Password only while Basic Auth is on. The session actions, Set Default Preferences and GIF Transcoding restart the service, which takes the web UI down briefly, and so does Set Primary URL when it changes the link URL. The Basic Auth actions apply at once, without a restart.

- **Add Twitter/X Session** (`add-session`) — run at first setup, when an account's cookies have expired or it has been restricted (pages error, timelines come back empty), or to add another account. Writes `sessions.jsonl`: a known username's line is replaced, keeping its `id`, and a new username is appended. A leading `@` is stripped. Safe to repeat: re-adding a username replaces its cookies. The cookies are not checked when added; X's verdict shows in the Twitter/X Sessions health check once teapot uses them. More accounts give more headroom: teapot uses one that isn't rate-limited for the request, and moves to another when it is.
- **Remove Twitter/X Session** (`remove-session`) — run to retire an account. Removes that username's line; disabled while no session is stored. Removing the last one leaves teapot unable to fetch anything, and nothing prompts the user to add another.
- **Configure Basic Auth** (`configure-basic-auth`) — run to put a login in front of the web UI or take it off. Turning it on generates a 22-character password the first time and keeps the stored one after that, and returns it with the fixed username `admin`. Turning it off keeps the password, so turning it back on restores the same login. Running it again with Basic Auth on is how to see the current password. While on, it applies to every request to the HTTPS addresses: browsers prompt, RSS readers need `https://admin:<password>@<host>/<username>/rss`, and Discord embeds stop working.
- **Reset Basic Auth Password** (`reset-basic-auth-password`) — hidden while Basic Auth is off. Run when the password has leaked or someone should lose access. Generates a new 22-character password and returns it with the username; the old one stops working at once, so every RSS reader holding it needs the new one. It also sets Basic Auth on, so running it from the CLI while Basic Auth is off turns it on.
- **Set Primary URL** (`set-primary-url`) — run when links in feeds or embeds point at the wrong address, to give Discord a public URL, or when its task asks. Offers the interface's addresses except loopback, link-local and the container bridge, pre-selecting the stored URL, else the preferred address, and stores the choice as `primaryUrl` in `store.json`. Safe to repeat.
- **Set Default Preferences** (`set-preferences`) — run to change what visitors get before they set their own on teapot's Preferences page, which their browser keeps and which overrides these: the theme, infinite scrolling, and where links to Twitter/X, YouTube and Reddit open. Writes `preferences.*` in `teapot.toml`. A replacement takes a hostname, with `:port` if it isn't 443; a leading `https://` and a trailing `/` are dropped, and a value still holding a `/` or a space is refused. YouTube and Reddit replacements must serve HTTPS, because teapot keeps the link's scheme. With no Twitter/X replacement, those links open on this teapot. Safe to repeat.
- **GIF Transcoding** (`gif-transcoding`) — run to make Discord play X's GIFs inline. X serves GIFs as MP4 videos; while this is on, teapot converts one with ffmpeg when a Discord embed asks for it, caching up to 512 MB in `/data/cache/gif`. Writes `gifTranscoding.mode`: `local` on, `off` off. It matters only while Discord can reach the link URL. Safe to repeat.

## Tasks

The package raises three tasks, all on teapot's own page. All three are important, so none stops the service.

| Task (action)         | Severity  | Raised                                                                                                                                                                                                                 | Cleared                                                                                                    | Returns                                                  |
| --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Add Twitter/X Session | important | Once, at install                                                                                                                                                                                                       | When Add Twitter/X Session runs                                                                            | No; removing every session later does not raise it again |
| Configure Basic Auth  | important | At any init while `store.json` has no `basicAuth`, which is until Basic Auth has been configured                                                                                                                       | When Configure Basic Auth runs, either way, and by init once `basicAuth` exists                            | Only if `basicAuth` is removed                           |
| Set Primary URL       | important | While no primary URL is stored, from install on, and whenever the stored URL's hostname is not one of the service's addresses: an address or domain removed, or a backup restored onto a server whose addresses differ | When Set Primary URL runs, and by itself as soon as the stored URL's hostname is among the addresses again | Yes, whenever the URL goes missing again                 |

While the Set Primary URL task is up for a URL that went away, teapot keeps running and links to the preferred address, then returns to the stored URL when its hostname comes back. An IP address counts as gone while its network link is down.

## Health Checks

Two health checks are reported.

| Check              | ID         | Probes                                                   | Grace period |
| ------------------ | ---------- | -------------------------------------------------------- | ------------ |
| Web Interface      | `primary`  | teapot listening on 8080                                 | 10 seconds   |
| Twitter/X Sessions | `sessions` | teapot's `/.health`, once the web interface is listening | 10 seconds   |

A Web Interface failure after the grace period means teapot exited or never bound its port. Most often it refused its config at startup: an `hmacKey` that is missing or too short, or one of the other values it rejects (see [File Models](#file-models)). The reason is in the service's logs.

Twitter/X Sessions reports teapot's own count of its sessions:

- **Success**: at least one session is usable. The message gives how many, and how many X refused, if any; those need fresh cookies from Add Twitter/X Session.
- **Loading**: every session X has not refused is rate-limited. X lifts that within 15 minutes, and the check recovers by itself.
- **Failure**: there are no sessions, X refused every one, or teapot did not answer.

teapot forgets refusals when it restarts, so a refused session counts as usable until teapot next tries it. A session limited on only some endpoints still counts as usable, so search, say, can fail on rate limits while the check passes.

`/.health` and `/.sessions` are upstream's debug endpoints, on because the check needs them. They answer only to `config.debugToken` as a bearer token, which is generated and never shown; any other request gets a 404.

## Backups and Restore

A backup copies the `main` volume except the GIF cache, `cache/`, which teapot fills again as Discord asks for GIFs. Nothing is dumped.

That covers everything the package keeps: `teapot.toml` with its `hmacKey`, `sessions.jsonl`, and `store.json` with the primary URL and Basic Auth settings, along with teapot's own `session-limits.json`. A backup therefore carries live Twitter/X session cookies and the Basic Auth password.

After a restore:

- Sessions keep working as long as Twitter/X has not expired or revoked their cookies; replacing them is Add Twitter/X Session again.
- On a different server, or one whose addresses have changed, the restored primary URL is not among the service's addresses, so the Set Primary URL task is raised and teapot links to the preferred address until a URL is chosen (see [Tasks](#tasks)).
- Basic Auth comes back as it was, with the same password.
- The Configure Basic Auth task comes back only if the backup has no `basicAuth`, that is, if Basic Auth was never configured.

## Limitations and Differences

1. **No content without a session.** teapot has no anonymous mode; until an account's cookies are added, every profile and post request fails.
2. **The account is at risk.** Twitter/X may flag or suspend accounts whose cookies are used this way, which is why the Add Twitter/X Session warning recommends a throwaway account.
3. **GIF transcoding starts off.** Upstream turns it on by default; here it waits for GIF Transcoding, because converting uses the server's CPU. Upstream's `external` mode, which hands conversion to a separate service, isn't offered.
4. **Most of teapot's server settings have no StartOS UI.** Cache, Kagi translation and the rest of `config.*` stay at upstream's defaults unless `teapot.toml` is edited by hand (see [File Models](#file-models)). Set Default Preferences covers only the preferences upstream reads from its config; the rest are set per browser on teapot's Preferences page.
5. **Upstream has no releases.** The package builds a pinned upstream commit.
6. **Basic Auth is a StartOS addition.** Upstream has no login. StartOS's reverse proxy asks for it on every request to the HTTPS addresses, so RSS readers need the credentials in the feed URL and Discord embeds stop working, because Discord's crawler cannot log in. The plain-HTTP address goes straight to teapot with no login. StartOS offers it only to other services on the server and on a gateway set secure with `start-cli net gateway set-secure`, so on such a gateway Basic Auth does not protect teapot.
7. **One link URL serves everyone.** Links in feeds and embeds always use it, whichever address a reader came in on, and Discord embeds need it to be publicly reachable.
8. **Each visitor's X budget is per address.** teapot caps how fast each client can make uncached X calls, a burst of 200 and then 3 a minute, with cached pages free. It takes the visitor's address from StartOS's reverse proxy, so visitors behind one router share a budget, and so do visitors arriving over Tor. A client that uses its budget up gets teapot's rate-limit message until it refills. Setting `config.clientBudget = false` in `teapot.toml` removes the cap; X's own limits still apply.

---

## Quick Reference for AI Consumers

The package's operable surface in one block; its keys follow the sections above.

```yaml
package_id: teapot
image:
  teapot: built from source by this repo's Dockerfile, with ffmpeg
architectures: [x86_64, aarch64]
subcontainers: [teapot-sub]
volumes:
  main: /data
file_models:
  - /data/teapot.toml
  - /data/sessions.jsonl
  - /data/store.json
startos_managed_env_vars:
  - TEAPOT_CONF_FILE
  - TEAPOT_SESSIONS_FILE
  - TEAPOT_SESSION_STATE_FILE
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - add-session
  - remove-session
  - configure-basic-auth
  - reset-basic-auth-password
  - set-primary-url
  - set-preferences
  - gif-transcoding
tasks:
  - { action: add-session, severity: important }
  - { action: configure-basic-auth, severity: important }
  - { action: set-primary-url, severity: important }
health_checks:
  - primary
  - sessions
```
