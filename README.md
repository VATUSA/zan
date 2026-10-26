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

The API stores everything in `api/zan.db` (SQLite, schema created on startup in `api/db.js`)
and `api/uploads/`. Compose bind-mounts both.

## Deployment

- `zan.service` is a systemd unit that runs the Compose stack from `/srv/zan`.
- `api/.github/workflows` and `site/.github/workflows` call the shared VATUSA gitops
  workflows to build the `zan-api` and `zan-site` images. GitHub only runs workflows from
  the repo-root `.github/workflows/`, so these won't run until they are moved there and
  scoped per app.

## License

MIT. See [LICENSE.md](LICENSE.md).
