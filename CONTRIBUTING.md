# Contributing

This repo packages [teapot](https://github.com/amaanq/teapot) — a privacy-focused Twitter/X frontend written in Rust — for StartOS.

## Documentation — keep it in sync

- **`README.md`** — what this package is and how it's built (image, volumes, interfaces, actions, dependencies). For developers and AI assistants.
- **`instructions.md`** — the user-facing instructions packed into the `.s9pk` and shown on the **Instructions** tab in StartOS, for the person running the service.
- **`UPDATING.md`** — how to bump the upstream version.
- **`CONTRIBUTING.md`** — this file.
- **`AGENTS.md` / `CLAUDE.md`** — operating rules for AI developers working in this repo.

**Any code change that warrants it must update `README.md` and `instructions.md` in the same change** — a new or renamed action, an added or removed volume / port / interface / dependency, a changed default, a new limitation, any altered user-visible behavior. Don't defer: a package that ships with a stale README or stale instructions is not done, even if the code is perfect. Content rules live in the packaging guide: [Writing READMEs](https://docs.start9.com/packaging/writing-readmes.html) and [Writing Service Instructions](https://docs.start9.com/packaging/writing-instructions.html).

## Building

See the [StartOS Packaging Guide](https://docs.start9.com/packaging/) for environment setup, then:

```bash
npm ci    # install dependencies
make      # build both .s9pk packages (x86_64 + aarch64)
```

The `make` step invokes `start-cli s9pk pack`, which builds the teapot image from this repo's `Dockerfile` — upstream publishes no container image or binaries, so the Rust binary is compiled from a pinned source commit (`TEAPOT_COMMIT` in the `Dockerfile`). The x86_64 build runs under emulation on ARM hosts and takes a few minutes. Sideload the resulting `.s9pk` onto a StartOS box to test.

## Releasing

Pushing a tag (`v<version>_<revision>`, e.g. `v0.1.0_0`) triggers `.github/workflows/release.yml`: it builds both `.s9pk`s, signs them with the developer key (`DEV_KEY` repo secret, the contents of `~/.startos/developer.key.pem`), and creates a GitHub Release with SHA256 sums and the release notes from the manifest.

## Updating versions

Upstream is untagged — the pin is a master commit. See [`UPDATING.md`](UPDATING.md) for the full procedure:

1. `Dockerfile` → `TEAPOT_COMMIT` (the upstream commit SHA).
2. `startos/versions/current.ts` → `version` (`<upstream cargo version>:<revision>`) and `releaseNotes`. A *new* file under `startos/versions/` is only needed when the bump carries an `up`/`down` migration, or to preserve old release notes in git history — see [Versions](https://docs.start9.com/packaging/versions.html).

## Package-specific notes

- **Sessions are mandatory for content.** teapot fetches through the Twitter/X API using `auth_token`/`ct0` cookies stored in `/data/sessions.jsonl` (a raw JSONL file model). The service runs without them but every content request fails.
- **`hmacKey` is generated on install** (`startos/init/seedFiles.ts`) — teapot refuses to start without a ≥32-char non-default secret.
- **Basic Auth is a StartOS addition.** Upstream has no auth; a bundled Caddy daemon owns the exposed port 8080 and reverse-proxies teapot on internal 8081. Credentials (fixed username `admin`, generated password) live in `store.json`; the password is bcrypt-hashed into the Caddyfile at startup via `caddy hash-password`.
- **Config and sessions are read only at startup** — `main.ts` reads all three files (`teapot.toml`, `sessions.jsonl`, `store.json`) with `.const()`, so any change restarts the daemons.
- **GIF transcoding is pinned off** (`gifTranscoding.mode = "off"`); enabling it would require shipping ffmpeg in the image.

## How to contribute

1. Fork the repository and create a branch from `master`.
2. Make your changes — including the doc updates above.
3. Open a pull request to `master`.
