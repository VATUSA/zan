# zan

Website and API for ZAN (Anchorage ARTCC), a VATUSA facility on VATSIM.

Originally written by Jason Calder in two separate repositories, combined here with full
history.

| Dir | What | Stack |
|-----|------|-------|
| `api/` | Backend API: VATSIM Connect login, roster, endorsements, visiting applications, events, feedback, files, weather, Discord linking, VATUSA role sync | Node.js, Express 5, SQLite (`better-sqlite3`) |
| `site/` | Frontend SPA | React 19, React Router 7, Vite, Tailwind CSS 3; served by nginx in Docker |

## Local development

Each app runs on its own:

```sh
# API on :4000
cd api
cp .env.example .env   # fill in VATSIM, VATUSA and SESSION_SECRET values
npm install
npm start
npm test

# Site on :5173
cd site
cp env.example .env    # fill in VITE_VATSIM_CLIENT_ID
npm install
npm run dev
```

Or run both together with Docker Compose from the repo root (API on :4000, site on :3000):

```sh
docker compose -f compose.local.yml up --build
```

Compose stops with an error unless `VATSIM_CLIENT_ID`, `VATSIM_CLIENT_SECRET`,
`VATUSA_API_KEY`, `SESSION_SECRET` and `VITE_VATSIM_CLIENT_ID` are set in the environment
or in a root `.env` file.

VATSIM Connect has to be configured consistently: the site's `VITE_VATSIM_AUTH_URL` and the
API's `VATSIM_TOKEN_URL` must point to the same environment (sandbox `auth-dev` or
production), and the site's redirect URI must exactly match the API's
`FRONTEND_REDIRECT_URI`.

## Persistent state

The API stores everything in a SQLite database (`DB_PATH`, default `api/zan.db`; schema
created on startup in `api/db.js`) and `api/uploads/`. Compose bind-mounts both.

## Deployment

CI uses the shared VATUSA gitops workflows, the same way the other VATUSA repos do. The
images are `vatusa/zan-api` and `vatusa/zan-site`, and the kustomization folder is `zan`:

- `ci-master.yml`: every push to `main` builds both images (`:<sha>` and `:latest`) and
  bumps the `zan/overlays/dev` image tags in gitops.
- `prod-release.yml`: run manually to point `zan/overlays/prod` at an already-built commit.
- `build-branch.yml`: run manually to build `:<sha>` and `:branch-<name>` images from a
  non-default branch, without deploying anything.

Both images build with the repo root as the context (`docker build -f api/Dockerfile .`), so
the root `.dockerignore` applies to both.

## License

MIT. See [LICENSE.md](LICENSE.md).
