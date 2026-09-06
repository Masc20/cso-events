# cms-server

A [Taproot](https://github.com/jeremybise/taproot) CMS server: the admin panel, the REST API, and
the delivery API that a website reads content from.

**This is not the website.** Taproot is two deployments — this one owns the database and is where
content is written, and a separate Astro project installs `@taprootcms/astro`, holds an API key,
and renders the pages visitors see. Keeping them apart is why editing a page cannot take the site
down, and why the site can be rebuilt without touching what you have written.

## Getting started

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Then open <http://localhost:4321>. There are no accounts yet, so it takes you to a one-time setup
screen that creates the first administrator — the starter content is already there waiting.

> Complete that setup before putting this anywhere public. Until an account exists, whoever reaches
> the URL first becomes the administrator.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | The CMS at <http://localhost:4321> |
| `npm run db:migrate` | Apply pending migrations to the local database |
| `npm run db:seed` | Create the starter content. Safe to re-run |
| `npm run db:migrate:remote` | Apply them to your deployed D1 database |
| `npm run db:reindex` | Rebuild the listing index. Run once after a migration says to; safe to re-run |
| `npm run preview` | Build and serve through `wrangler dev` — the real Workers runtime |
| `npm run deploy` | Build and `wrangler deploy` |

## This folder is yours — put it in version control

It looks like scaffolding output, but it is your deployment. The CMS arrives through
`node_modules`; what is here is the part that cannot be regenerated — the Cloudflare resource ids
in `wrangler.jsonc`, the build configuration, the Worker entry, and the lockfile recording exactly
which version of Taproot is deployed.

```bash
git init && git add . && git commit -m "New Taproot server"
```

`.gitignore` already excludes `.env` and the local database, which are the two things that must
never be committed — `.env` holds your Cloudflare API token. Everything else is safe to commit,
including the resource ids: they are identifiers rather than credentials, which is why secrets go
through `wrangler secret put` instead.

## Upgrading

```bash
npm install @taprootcms/core@latest @taprootcms/studio@latest
npm run db:migrate:remote
npm run deploy
```

The two packages share a version and move together. Migrate **before** deploying: migrations are
additive, so old code tolerates the new schema, while new code cannot run against the old one.

## Deploying

The target is Cloudflare Workers + D1 + R2. In short: create the D1 database, the R2 bucket, and the
KV namespace, paste their ids into `wrangler.jsonc`, run `npm run db:migrate:remote`, then
`npm run deploy`. The handbook has the full sequence, including the API key your website will
need.

## Building the website

A second project, which installs the client and reads from this one:

```bash
npm install @taprootcms/astro
```

It needs two environment variables — the URL this server is deployed at, and an API key you issue
from **Settings → API keys**. The handbook's "Building a site" section covers rendering a page,
blocks, images, and menus.
