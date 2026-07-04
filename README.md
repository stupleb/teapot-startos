<p align="center">
  <img src="icon.png" alt="teapot Logo" width="21%">
</p>

# teapot on StartOS

> **Upstream docs:** <https://github.com/amaanq/teapot>
>
> Everything not listed in this document should behave the same as upstream
> teapot. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

[teapot](https://github.com/amaanq/teapot) is a privacy-focused Twitter/X frontend written in Rust: no JavaScript required, no tracking, no ads, RSS feeds for user timelines, and rich Discord embeds. It fetches content through the Twitter/X API using session cookies from a logged-in account.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                                 |
| ------------- | --------------------------------------------------------------------- |
| Image         | Built from source by this repo's `Dockerfile` (upstream publishes no image or binaries) |
| Source pin    | A specific upstream master commit (`TEAPOT_COMMIT` in the `Dockerfile`) |
| Architectures | x86_64, aarch64                                                        |
| Command       | `teapot` with `TEAPOT_CONF_FILE=/data/teapot.toml` and `TEAPOT_SESSIONS_FILE=/data/sessions.jsonl` |
| Static assets | Upstream `public/` baked into the image at `/app/public` (`staticDir`) |

Upstream is untagged and unreleased; the package version tracks upstream's Cargo version, and the exact commit is pinned in the `Dockerfile`.

---

## Volume and Data Layout

| Volume | Mount Point | Purpose                                          |
| ------ | ----------- | ------------------------------------------------ |
| `main` | `/data`     | `teapot.toml` (config) and `sessions.jsonl` (Twitter/X session cookies) |

Both files are owned and rewritten by StartOS (file models); do not hand-edit them.

---

## Installation and First-Run Flow

1. On install, StartOS seeds `/data/teapot.toml` with upstream defaults and a generated `hmacKey` (teapot requires a ≥32-character non-default secret; it is internal and never shown).
2. An empty `/data/sessions.jsonl` is created. teapot starts and serves its UI, but cannot fetch any content until a session is added.
3. An **important task** points the user at the **Add Twitter/X Session** action.
4. The primary URL (used for RSS links and embeds) defaults to the service's `.local` address; change it with **Set Primary URL**.

---

## Configuration Management

| StartOS-Managed                                                        | Upstream-Managed (defaults kept)                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| `server.address` (0.0.0.0), `server.port` (8080), `server.staticDir`   | `cache.*`, `preferences.*` (theme, link replacements)   |
| `server.hostname` / `server.https` / `server.publicPort` (via **Set Primary URL**) | `config.*` API options (proxy, kagi, maxConcurrentReqs) |
| `config.hmacKey` (generated on install)                                 | —                                                       |
| `sessions.jsonl` (via session actions)                                  | —                                                       |
| `gifTranscoding.mode` (forced `off`)                                     | —                                                       |

Config changes and session changes restart the service automatically (teapot only reads both files at startup).

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose        |
| --------- | ---- | -------- | -------------- |
| Web UI    | 8080 | HTTP     | teapot web app |

**Access methods:**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

For Discord embeds to work, the primary URL must be publicly reachable (e.g. a clearnet domain via a tunnel or router).

---

## Actions (StartOS UI)

| Action                    | Purpose                                                                   | Availability | Inputs                          |
| ------------------------- | ------------------------------------------------------------------------- | ------------ | ------------------------------- |
| Add Twitter/X Session     | Store `auth_token`/`ct0` cookies from a logged-in Twitter/X account. Re-adding a username replaces its tokens. | Any status   | username, `auth_token`, `ct0` (masked) |
| Remove Twitter/X Session  | Delete a stored session (select by username). Disabled when none stored.  | Any status   | username (select)               |
| Set Primary URL           | Choose which service URL teapot uses for generated links (RSS, embeds).   | Any status   | URL (select from own interfaces) |

---

## Backups and Restore

**Included in backup:**

- `main` volume (config, HMAC key, and session tokens)

**Restore behavior:** Volume is fully restored before the service starts. Restored session tokens keep working unless Twitter/X has invalidated them.

---

## Health Checks

| Check         | Method                 | Messages                                                                        |
| ------------- | ---------------------- | ------------------------------------------------------------------------------- |
| Web Interface | Port listening (8080)  | Success: "The web interface is ready" / Error: "The web interface is not ready" |

The health check reports ready even with zero sessions — the UI is up, but content requests will fail until a session is added.

---

## Dependencies

None.

---

## Limitations and Differences

1. **Session tokens are mandatory for content** — teapot has no anonymous/guest mode. Without a stored session, every profile/tweet request fails.
2. **Accounts used for scraping risk suspension** — the install alert and the Add Session action both recommend a throwaway account.
3. **GIF transcoding is disabled** (`gifTranscoding.mode = "off"`); the optional ffmpeg-based pipeline is not shipped in the image.
4. **`cache`, `preferences`, and advanced `config` options are not yet exposed** in the StartOS UI; they are pinned to upstream defaults in `/data/teapot.toml`.
5. **Kagi summarizer integration is not configured** (`kagiToken` empty).
6. **Upstream is unversioned** — the package builds a pinned master commit rather than a tagged release.

---

## What Is Unchanged from Upstream

- The web UI, themes, and all routes
- RSS feeds for user timelines (`enableRSS = true`, upstream default)
- Discord embed / ActivityPub JSON endpoints
- Session pool behavior (rotation, rate-limit tracking)
- All caching behavior and defaults

---

## Quick Reference for AI Consumers

```yaml
package_id: teapot
image: built from source (Dockerfile in this repo, pinned upstream commit)
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  ui: 8080
dependencies: none
startos_managed_env_vars:
  - TEAPOT_CONF_FILE
  - TEAPOT_SESSIONS_FILE
managed_files:
  - /data/teapot.toml
  - /data/sessions.jsonl
actions:
  - add-session
  - remove-session
  - set-primary-url
```
