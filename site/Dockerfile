ARG NODE_VERSION=24.19.0-slim

# Vite's build output is static assets with nothing architecture-specific in it, so these
# stages can stay pinned to the runner's native arch - only the final nginx stage below
# needs to resolve per target platform.
FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.29-alpine AS app
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# The shared CI workflow (common-build.yml) has no way to pass Docker build-args, and
# baking VITE_* values in at build time would tie one image to one environment anyway.
# Instead this script (run automatically by the nginx image's own entrypoint) writes
# env-config.js from the container's real runtime env - see src/config.js and
# docker-entrypoint.d/40-env-config.sh. VITE_VATSIM_REDIRECT_URI must exactly match the
# api's FRONTEND_REDIRECT_URI or the OAuth token exchange fails; see env.example.
COPY docker-entrypoint.d/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh
EXPOSE 80
