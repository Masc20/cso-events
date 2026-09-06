# CSO Events Platform

> **Official Events Portal & Headless Content Management System**  
> Computer Studies Organization (CSO) • ACLC College Of Mandaue

---

## System Overview

The **CSO Events Platform** is structured as a decoupled two-tier architecture:

1. **`cms-server/` (Headless CMS Backend)**: Powered by [Taproot CMS](https://github.com/jeremybise/taproot), deployed on Cloudflare Workers with Cloudflare D1 (SQLite) and R2 media storage. Serves the administration studio, delivery API, and content schema.
2. **`cms-client/` (Events Portal Frontend)**: High-performance public website built with [Astro 5](https://astro.build/) and [Tailwind CSS v4](https://tailwindcss.com/). Consumes the CMS delivery API, rendering committee profiles, scheduled hackathons, esports tournaments, workshops, and partner collaborations.

```text
                                    SYSTEM TOPOLOGY
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  Cloudflare Global Edge                                │
│                                                                                        │
│   ┌────────────────────────────────┐                 ┌─────────────────────────────┐   │
│   │     cms-client (Frontend)      │  Delivery API   │    cms-server (Taproot)     │   │
│   │  • Astro 5 (SSG / Edge)        │ ◄────────────── │  • Cloudflare Worker API    │   │
│   │  • Tailwind CSS v4             │  (Read Content) │  • Taproot Admin Studio     │   │
│   │  • Dark / Light Theme System   │                 │  • Cloudflare D1 (SQLite)   │   │
│   │  • Pointed Ribbon Design       │                 │  • R2 Asset Storage         │   │
│   │  Port: 3000                    │                 │  Port: 4321                 │   │
│   └────────────────────────────────┘                 └──────────────┬──────────────┘   │
│                                                                     │ Admin Auth       │
│                                                                     ▼                  │
│                                                       ┌────────────────────────────┐   │
│                                                       │     CSO Administrators     │   │
│                                                       │   (Manage Events & Wings)  │   │
│                                                       └────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```text
CSO_Events/
├── README.md               # Global project documentation (this file)
├── .gitignore              # Repository gitignore rules
│
├── cms-server/             # Taproot CMS backend & Admin Studio
│   ├── data/               # Local SQLite database (taproot.sqlite)
│   ├── src/                # Worker handlers, schemas & custom hooks
│   ├── wrangler.jsonc      # Cloudflare Workers & D1 configuration
│   └── package.json        # CMS dependencies & migration scripts
│
└── cms-client/             # Astro frontend website (package: cso-events)
    ├── public/             # Static logos, icons, committee brand assets
    ├── src/
    │   ├── components/     # UI components (Navbar, CommitteeCard, EventCard, etc.)
    │   ├── layouts/        # Layout.astro (Theme manager, head meta)
    │   ├── lib/            # api.ts (Centralized API service), taproot.ts
    │   ├── pages/          # index.astro (Calendar & Directory), /events/[slug].astro
    │   ├── styles/         # global.css (Design tokens & ribbon clip styles)
    │   └── types/          # Centralized TypeScript definitions & defaults
    └── package.json        # Frontend dependencies (Astro, Tailwind v4)
```

---

## Prerequisites

- **Node.js**: `v22.12.0` or newer (required by `package.json` engines)
- **Package Manager**: `npm` (v10+)
- **Cloudflare Wrangler CLI**: (optional, for Cloudflare deployments)

---

## Getting Started (Local Development)

To run the complete platform locally, run the backend CMS and the frontend client in separate terminal windows.

### Step 1: Start the CMS Server

```bash
cd cms-server

# 1. Install dependencies
npm install

# 2. Run local database migrations & seed starter data
npm run db:migrate
npm run db:seed

# 3. Start local CMS dev server
npm run dev

```

* **Admin Studio & Delivery API URL**: `http://localhost:4321`
* *First-time setup*: Open `http://localhost:4321` in your browser to create the initial administrator account.

---

### Step 2: Start the Events Portal Frontend

In a new terminal window:

```bash
cd cms-client

# 1. Install dependencies
npm install

# 2. Start Astro development server
npm run dev

```

* **Frontend Portal URL**: `http://localhost:3000`
* By default, `cms-client` automatically queries the local CMS running at `http://localhost:4321`.

---

## Packages & Core Features

### 1. `cms-client` (Frontend Portal)

Built with modern Astro 5 island architecture and Tailwind CSS v4:

| Frontend Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local dev server at `http://localhost:3000` |
| `npm run build` | Compiles production static assets to `dist/` |
| `npm run check` | Runs Astro & TypeScript diagnostics (`astro check`) |
| `npm run preview` | Previews local production build |

---

### 2. `cms-server` (Taproot CMS Backend)

A serverless Headless CMS tailored for student organizations and enterprise sites:

* **Cloudflare Native**: Runs on Cloudflare Workers with serverless edge compute.
* **D1 SQLite Database**: Zero-maintenance edge relational database with atomic migrations.
* **Schema Management**: Configured for `committee`, `event`, and media entities.
* **Delivery REST API**: High-speed JSON endpoints read by `@taprootcms/astro`.

| CMS Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local studio at `http://localhost:4321` |
| `npm run db:migrate` | Applies pending migrations to local SQLite database |
| `npm run db:seed` | Populates initial sample data |
| `npm run db:migrate:remote` | Applies migrations to remote Cloudflare D1 database |
| `npm run deploy` | Deploys Worker to Cloudflare |

---

## Design System & Tokens

All semantic design variables are defined in [`cms-client/src/styles/global.css`](file:///C:/Users/Mel/Documents/clients/CSO_Events/cms-client/src/styles/global.css):

| Semantic Token | Light Mode (`:root`) | Dark Mode (`html.dark`) | Notes |
| :--- | :--- | :--- | :--- |
| `--bg-page` | `#f8fafc` (Slate-50) | `#09090b` (Zinc-950) | Main canvas background |
| `--bg-surface` | `#ffffff` (White) | `#18181b` (Zinc-900) | Primary cards & surfaces |
| `--bg-subtle` | `#f1f5f9` (Slate-100) | `#121215` (Zinc-950) | Inset sections & inputs |
| `--border-subtle`| `#e2e8f0` (Slate-200) | `#27272a` (Zinc-800) | Standard borders & dividers |
| `--text-primary` | `#0f172a` (Slate-900) | `#f4f4f5` (Zinc-100) | 14:1+ AAA contrast |
| `--text-secondary`| `#334155` (Slate-700) | `#a1a1aa` (Zinc-400) | 8:1+ AAA contrast |
| `--text-muted` | `#64748b` (Slate-500) | `#71717a` (Zinc-500) | 4.6:1+ AA contrast |
| `--accent-emerald`| `#059669` (Emerald-600)| `#34d399` (Emerald-400)| Accessible brand green |

---

## Cloudflare Deployment Guide

### Deploying `cms-server` (Backend)
1. Configure `wrangler.jsonc` with your Cloudflare `database_id`.
2. Add your Cloudflare credentials to `cms-server/.env` (`TAPROOT_CF_ACCOUNT_ID`, `TAPROOT_CF_API_TOKEN`).
3. Run migrations and deploy:

   ```bash
   cd cms-server
   npm run db:migrate:remote
   npm run deploy
   ```

### Deploying `cms-client` (Frontend)
1. Ensure your CMS is publicly accessible or exposed via Cloudflare Tunnel.
2. In Cloudflare Pages / Workers Static Assets, set:
   * **Framework preset**: `Astro`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
   * **Environment Variables**:
     * `NODE_VERSION`: `22`
     * `TAPROOT_API_URL`: URL of your deployed `cms-server`
     * `TAPROOT_API_KEY`: API delivery key generated in the Taproot Studio

---

## Organization & Credits

Maintained by the **Computer Studies Organization (CSO)**  
*ACLC College Of Mandaue • Mandaue City, Cebu*  

* Contact: `computerstudiesorganzation.aclc@gmail.com`  
* Facebook: [Official CSO Facebook Page](https://www.facebook.com/profile.php?id=100094218363222)
