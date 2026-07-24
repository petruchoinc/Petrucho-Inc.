# Petrucho Inc. Site

A Vite + React single-page site for Petrucho Inc. with a local-first architecture, admin-only editing tools, and a PayPal subscription flow.

## Overview

This project is now built as a frontend-only application that stores content and entity data locally in the browser via `localStorage`, seeded from the CSV exports in the `data/` folder.

It includes:

- a public landing experience for regular visitors
- an admin mode for editing content and managing entities
- a PayPal subscription path for checkout and return handling
- a custom vector favicon/logo sourced from the root `icon.svg`

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Radix UI primitives
- localStorage-backed local data adapter
- PayPal sandbox integration hooks

## Project Structure

```text
.
├── data/                  # CSV seed data for local entities
├── src/
│   ├── api/               # local data client / adapters
│   ├── components/        # UI sections and shared components
│   ├── lib/               # auth, theme, site text, utilities
│   └── pages/             # route-level pages
├── index.html
├── icon.svg               # site logo / favicon source
└── package.json
```

## Local Development

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm run dev
```

Then open the local URL printed by Vite in the terminal.

### Admin mode

The app supports a public mode and an admin mode:

- public mode: `http://localhost:5173/`
- admin mode: `http://localhost:5173/?mode=admin`

When `mode=admin` is present, admin-only controls become available.

## Environment Variables

Create a `.env.local` file in the project root if you want to configure the PayPal flow:

```bash
VITE_PAYPAL_CLIENT_ID=your_client_id
VITE_PAYPAL_SECRET=your_secret
VITE_PAYPAL_MODE=sandbox
VITE_PAYPAL_RETURN_URL=http://localhost:5173/subscribe/return
```

The app currently uses a local adapter layer, so most content is persisted locally and does not require a cloud backend.

## Data Model

The site reads its initial entity data from the CSV files in `data/` and persists edited values in browser storage.

Supported local entities include:

- `Employee`
- `PaypalPlan`
- `PortfolioItem`
- `ResourceLink`
- `SiteText`
- `Subscription`
- `Theme`

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Notes

- The root `icon.svg` is used as the site favicon/logo asset.
- The app is intentionally local-first and does not depend on the previous Base44 cloud runtime for basic content editing.
- PayPal checkout is currently sandbox-oriented for development/testing.

## License

This repository is intended for the Petrucho Inc. project and its internal site maintenance workflow.
