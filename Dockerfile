# teapot for StartOS
#
# Upstream publishes no container image and no release binaries, so we build
# from source. Pinned to a master commit — upstream is untagged (Cargo version
# 0.1.0); bump TEAPOT_COMMIT together with the package version.

ARG TEAPOT_COMMIT=06df4d962c204cb8a7954972b105907a6550210f

# ---- build stage ------------------------------------------------------------
FROM rust:1-slim-bookworm AS build

ARG TEAPOT_COMMIT

ADD https://github.com/amaanq/teapot/archive/${TEAPOT_COMMIT}.tar.gz /tmp/teapot.tar.gz
RUN mkdir /src && tar -xzf /tmp/teapot.tar.gz -C /src --strip-components=1

WORKDIR /src
RUN cargo build --release --locked

# ---- ffmpeg stage -----------------------------------------------------------
# Only what upstream's src/transcode.rs runs; Debian's ffmpeg package adds ~390 MB.
FROM debian:bookworm-slim AS ffmpeg

ARG FFMPEG_VERSION=9.0.2
ARG FFMPEG_SHA256=8c3850283eb25fa026482078a04051e0be17347b09ef81a0849bec15a96e002e

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential ca-certificates curl nasm pkg-config xz-utils zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /tmp/ffmpeg.tar.xz https://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.xz \
    && echo "${FFMPEG_SHA256}  /tmp/ffmpeg.tar.xz" | sha256sum -c - \
    && mkdir /ffmpeg \
    && tar -xJf /tmp/ffmpeg.tar.xz -C /ffmpeg --strip-components=1

WORKDIR /ffmpeg
RUN ./configure \
        --disable-everything --disable-autodetect --disable-doc --disable-network \
        --disable-ffplay --disable-ffprobe \
        --enable-zlib \
        --enable-protocol=file \
        --enable-demuxer=mov,image2 --enable-muxer=gif,image2 \
        --enable-decoder=h264,png --enable-encoder=gif,png \
        --enable-parser=h264,png \
        --enable-filter=fps,scale,palettegen,paletteuse \
    && make -j"$(nproc)" ffmpeg

# ---- runtime stage ----------------------------------------------------------
FROM debian:bookworm-slim

# ca-certificates: teapot talks to the Twitter/X API over TLS (rustls reads the
# system root store).
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
# Fails while the store still trusts emSign ECC Root CA - G3 (fixed in 20250419~deb12u2).
RUN test -s /etc/ssl/certs/ca-certificates.crt \
    && ! grep -q 'RzMwHhcNMTgwMjE4MTgzMDAwWhcNNDMwMjE4MTgzMDAwWjBrMQswCQYDVQQGEwJJ' /etc/ssl/certs/ca-certificates.crt

COPY --from=build /src/target/release/teapot /usr/local/bin/teapot
# gifTranscoding mode "local" runs it.
COPY --from=ffmpeg /ffmpeg/ffmpeg /usr/local/bin/ffmpeg
# Static assets; teapot.toml points staticDir here.
COPY --from=build /src/public /app/public

WORKDIR /app
CMD ["teapot"]
