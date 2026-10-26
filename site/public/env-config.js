// Placeholder for local `npm run dev`/`vite preview` and as a build-output fallback.
// In the Docker image this file is regenerated at container startup (see
// docker-entrypoint.d/40-env-config.sh) from real runtime env vars - src/config.js
// falls back to import.meta.env.VITE_* when these are unset, which is what happens here.
window.__ENV__ = {}
