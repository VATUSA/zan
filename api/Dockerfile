ARG NODE_VERSION=24.19.0-slim

FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Unlike the site's static build, better-sqlite3 ships a prebuilt native binding chosen by
# the *building* machine's arch. Staying off --platform=$BUILDPLATFORM here means buildx
# runs this stage under emulation once per target platform, so each image gets the binding
# built for its own arch instead of an amd64 runner silently producing an arm64 image with
# an x64 .node file in it.
FROM base AS dependencies
# better-sqlite3 has no prebuilt binary for this Node build, so npm falls back to compiling
# it from source via node-gyp, which needs a C++ toolchain and Python.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev

FROM base AS app
ENV NODE_ENV=production
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node api/ .
# /app itself is root-owned by default (created by WORKDIR before any --chown COPY runs).
# better-sqlite3 creates zan.db (and its -journal file) in whatever directory DB_PATH points
# at, so that directory must be writable by the node user. data/ is meant for a volume mount
# with DB_PATH=/app/data/zan.db. /app itself stays writable for the ./zan.db default.
RUN mkdir -p uploads data && chown node:node . uploads data

# The database and uploads/ are the app's only persistent state - both live on local disk
# (see db.js and routes/files.js) rather than an external database/object store. In
# production, mount durable storage over /app/data (with DB_PATH=/app/data/zan.db) and
# /app/uploads, or data is lost on every redeploy/restart.
VOLUME ["/app/data", "/app/uploads"]

USER node
EXPOSE 4000
CMD ["node", "index.js"]
