# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- Don't pre-fill Manage Access with the stored password, as SearXNG's does: the password is shown only when Manage Access generates it.
- Don't set `username` on the `ui` interface: the SDK folds it into the address as `admin@<host>`, which Chromium-based browsers refuse in a top-level navigation. The proxy still asks for it.
