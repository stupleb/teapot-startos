# TODO

Migrated to StartOS SDK 2.0.6 (`0.1.0:1`). Builds green (`tsc` + `ncc` + `s9pk pack`, both x86_64 and aarch64) and device-tested end-to-end — the first time this package has had a real run, covering install, upgrade in place over `0.1.0:0`, sessions, browsing, RSS, Set Primary URL and Basic Auth. That exercises both APIs the migration touched, neither of which fails at compile time: `sdk.host.getOwn('ui-multi')` behind the Set Primary URL dropdown, and lazy `SubContainer` / awaited `rootfs` behind the Caddyfile write.

- [ ] Consider removing the manifest's `alerts` block: `alerts` is absent from `SDKManifest` and is dropped at pack time, so the install alert never renders. **This predates the SDK 2.0 migration** — verified by inspecting both the released `v0.1.0_0` s9pk (packed on 1.5.3, `has("alerts")` → `false`) and the 2.0.6 build, so it is not something the migration broke. The warning it carried is already in `instructions.md` and the Add Session action, so nothing is lost by deleting it — it is dead weight either way.
- [ ] Consider exposing `preferences` (theme, infinite scroll, link replacements) via a Preferences action.
- [ ] Consider GIF transcoding support (needs ffmpeg in the image and `gifTranscoding` config exposure).
- [ ] Watch upstream for tags/releases and a stable versioning scheme.

CI moved back to the shared Start9 workflows in the same change. The `Pin start-cli v0.4.0-beta.9` step in `build.yml`/`release.yml` existed only because the package was SDK 1.5.3 — that CLI cannot pack a 2.0.x package, so it had to go with the migration.
