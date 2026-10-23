# Updating the upstream version

This package builds [amaanq/teapot](https://github.com/amaanq/teapot) from source — upstream publishes no container image, no release binaries, and (so far) no tags. The `teapot/` git submodule pins the upstream commit, and the package version is upstream's Cargo package version plus a revision.

## Where the binaries come from

**teapot** is compiled from the `teapot/` submodule by this repo's `Dockerfile`: a Rust build stage, then a Debian slim runtime with the binary and upstream's `public/` assets. The current pin is the submodule commit (`git submodule status`). The `rust` and `debian` base images are not pinned, so every pack builds on their current releases.

**ffmpeg**, for GIF transcoding, is compiled in the `Dockerfile`'s `ffmpeg` stage from a pinned FFmpeg release (`FFMPEG_VERSION`, `FFMPEG_SHA256`), with only the components upstream's `src/transcode.rs` uses. To move to a newer FFmpeg, check the release tarball's `.asc` against FFmpeg's release signing key (`FCF986EA15E6E293A5644F10B4322F04D67658D8`) before pinning its SHA-256.

## Determining the upstream version

- Check for tags first (upstream has published none so far). A tag, once there is one, is the pin:

  ```sh
  gh api repos/amaanq/teapot/tags
  ```

- Otherwise, a master commit that changes behaviour is the pin (docs, CI and formatting commits aren't). Read its Cargo version:

  ```sh
  gh api repos/amaanq/teapot/commits/master -q .sha
  curl -s https://raw.githubusercontent.com/amaanq/teapot/master/Cargo.toml | grep '^version'
  ```

## Before bumping

List what changed between the pinned commit and the candidate, then read the files that matter to the package:

```sh
gh api repos/amaanq/teapot/compare/<pinned-sha>...<new-sha> --jq '.files[].filename'
```

- `config/teapot.example.toml` and `src/config.rs` against `startos/fileModels/teapot.toml.ts` — a new, renamed or newly required key needs modelling. Keys the package pins (`server.address`, `server.port`, `server.staticDir`, `config.enableDebug`, `config.trustedProxies`, `gifTranscoding.*`) must still mean what the package assumes.
- `sessions.example.jsonl` and `src/api/auth.rs` against `startos/fileModels/sessions.jsonl.ts` — the session line format.
- `public/` — the `Dockerfile` copies it to `/app/public`, which `server.staticDir` points at. The file names in `public/css/themes/` are the theme list in `startos/actions/setPreferences.ts`.
- `src/routes/debug.rs` and `SessionStats` in `src/api/auth.rs` — the X Account Sessions health check reads `/.health` and its `sessions` counts.
- `src/transcode.rs` — the ffmpeg commands. A new demuxer, codec or filter there has to be added to the `configure` line in the `Dockerfile`, or GIF transcoding fails.
- Upstream's `README.md` — a new runtime requirement (an extra binary, a new environment variable) has to reach the image or the daemon.

## Checking both architectures

teapot is compiled separately for each architecture, so the check is the build itself: the PR's Build job packs x86_64 and aarch64, and a dependency that fails on one of them shows up there.

## Applying the bump

1. Move the submodule — `git -C teapot fetch && git -C teapot checkout <commit-or-tag>` — and stage `teapot`.
2. Update the package version in `startos/versions/current.ts`:
   - New upstream Cargo version → `<cargo-version>:0`
   - Same Cargo version, newer commit → bump the revision after the `:`
   - Release notes say what a user will notice, in one or two sentences, in every locale.
3. Apply whatever the diffs above call for in `startos/`.
4. Build and test, then review `README.md` and `instructions.md` for anything the bump made stale.
