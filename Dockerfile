# teapot for StartOS
#
# Upstream publishes no container image and no release binaries, so we build
# from source. Pinned to a master commit — upstream is untagged (Cargo version
# 0.1.0); bump TEAPOT_COMMIT together with the package version.

ARG TEAPOT_COMMIT=636c4bfdc685f6671e673d2117ae66bae081422d

# ---- build stage ------------------------------------------------------------
FROM rust:1-slim-bookworm AS build

ARG TEAPOT_COMMIT

ADD https://github.com/amaanq/teapot/archive/${TEAPOT_COMMIT}.tar.gz /tmp/teapot.tar.gz
RUN mkdir /src && tar -xzf /tmp/teapot.tar.gz -C /src --strip-components=1

WORKDIR /src
RUN cargo build --release --locked

# ---- runtime stage ----------------------------------------------------------
FROM debian:bookworm-slim

# ca-certificates: teapot talks to the Twitter/X API over TLS (rustls reads the
# system root store).
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /src/target/release/teapot /usr/local/bin/teapot
# Static assets; teapot.toml points staticDir here.
COPY --from=build /src/public /app/public

WORKDIR /app
CMD ["teapot"]
