#!/bin/sh
set -eu

# The nginx base image runs every executable script in /docker-entrypoint.d/ before
# starting nginx, so this fills in env-config.js from the *container's* env at startup
# instead of at `vite build` time. That's what lets one image be promoted dev -> prod:
# the values come from this deployment's ConfigMap/Secret, not from a Docker build-arg
# baked into the image. See src/config.js for how the app reads window.__ENV__.
cat > /usr/share/nginx/html/env-config.js <<EOF
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-}",
  VITE_VATSIM_AUTH_URL: "${VITE_VATSIM_AUTH_URL:-}",
  VITE_VATSIM_CLIENT_ID: "${VITE_VATSIM_CLIENT_ID:-}",
  VITE_VATSIM_REDIRECT_URI: "${VITE_VATSIM_REDIRECT_URI:-}"
};
EOF
