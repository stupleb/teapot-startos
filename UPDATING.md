# Updating the upstream version

This package builds [amaanq/teapot](https://github.com/amaanq/teapot) from source — upstream publishes no container image, no release binaries, and (so far) no tags. The "version" is upstream's Cargo package version plus a pinned master commit.

## Determining the upstream version

- Check for tags/releases first (none exist as of the initial package):

  ```sh
  gh api repos/amaanq/teapot/tags
  ```

- Otherwise pin the latest master commit and read the Cargo version:

  ```sh
  gh api repos/amaanq/teapot/commits/master -q .sha
  curl -s https://raw.githubusercontent.com/amaanq/teapot/master/Cargo.toml | grep '^version'
  ```

## Applying the bump

1. Update `TEAPOT_COMMIT` in the `Dockerfile` to the new commit SHA.
2. Update the package version in `startos/versions/current.ts`:
   - New upstream Cargo version → `<cargo-version>:0`
   - Same Cargo version, newer commit → bump the revision after the `:`
   - Mention the new commit (short SHA + date) in the release notes.
3. Diff upstream's `config/teapot.example.toml` and `src/config.rs` against `startos/fileModels/teapot.toml.ts` — add or adjust modeled keys if the config schema changed.
4. Diff `sessions.example.jsonl` / `src/api/auth.rs` against `startos/fileModels/sessions.jsonl.ts` if the session schema changed.
5. Build and test, then review `README.md` and `instructions.md` for anything the bump made stale.
