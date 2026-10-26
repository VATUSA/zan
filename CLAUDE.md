# CLAUDE.md

ZAN (Anchorage ARTCC) website: one repo holding two independent npm apps. There is no
workspace or monorepo tooling, so run npm commands inside `api/` or `site/`. See README.md
for setup and env vars.

## Layout

- `api/`: Express 5 ES modules, entry point `index.js` (port `PORT`, default 4000).
  - `routes/`: one file per feature (auth, roster, apply, events, feedback, files, admin,
    discord, weather).
  - `middleware/auth.js`: session/role checks. `utils/`: eligibility, roles, VATUSA role
    sync, session, validation.
  - `db.js`: SQLite via `better-sqlite3` on `zan.db`. Tables are created inline with
    `CREATE TABLE IF NOT EXISTS`, and there's no migration tool, so schema changes go
    here and must be safe to run against an existing database.
  - Tests: `node --test` (`npm test`), colocated as `utils/*.test.js`.
- `site/`: React 19 + Vite SPA, JSX (not TypeScript), Tailwind 3. Pages are in
  `src/pages/`; shared pieces are in `src/components`, `src/context`, `src/hooks` and
  `src/utils`. `npm run lint` runs ESLint.
  - `VITE_*` env vars are read by Vite in dev, but in the Docker image they're injected at
    container startup by `docker-entrypoint.d/40-env-config.sh`, not at build time.

## Gotchas

- VATSIM Connect environments must match on both sides (site `VITE_VATSIM_AUTH_URL` vs.
  api `VATSIM_TOKEN_URL`), and the site's redirect URI must equal the api's
  `FRONTEND_REDIRECT_URI`. Otherwise the token exchange fails.
- `NODE_ENV=production` turns on secure cookies and disables dev-login. Keep
  `development` for plain-http local use.
- `TRUST_PROXY_HOPS` controls how far the rate limiter trusts `X-Forwarded-For`. Set it to
  the real number of proxies in front of the api.
- The SQLite database (`DB_PATH`, default `api/zan.db`) and `api/uploads/` are the only
  persistent state. In k8s the database lives in a mounted directory (`/app/data`), never a
  single-file subPath mount: subPath creates a directory when the file is missing on the volume.
- Both Dockerfiles build with the repo root as the context, because the shared gitops build
  workflow always uses `.`. That means `COPY` paths are `api/...` or `site/...`, and the
  root `.dockerignore` covers both images. Workflows are in the root `.github/workflows/`.

## History

The history was imported from the original author's two repos, rewritten into `api/` and
`site/` subdirectories with `git filter-repo`. Preserve original commit authorship. Don't
rewrite or squash the imported history.
