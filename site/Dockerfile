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

# Vite inlines every VITE_* value into the built JS at build time - a static SPA has no
# runtime env injection, so these must be supplied as build args. See env.example for what
# each one means, and note VITE_VATSIM_REDIRECT_URI must exactly match the api's
# FRONTEND_REDIRECT_URI or the OAuth token exchange fails.
ARG VITE_API_URL
ARG VITE_VATSIM_AUTH_URL
ARG VITE_VATSIM_CLIENT_ID
ARG VITE_VATSIM_REDIRECT_URI
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_VATSIM_AUTH_URL=${VITE_VATSIM_AUTH_URL} \
    VITE_VATSIM_CLIENT_ID=${VITE_VATSIM_CLIENT_ID} \
    VITE_VATSIM_REDIRECT_URI=${VITE_VATSIM_REDIRECT_URI}
RUN npm run build

FROM nginx:1.29-alpine AS app
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
