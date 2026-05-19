# CreatorOS

A creator management platform built with React, Vite, Tailwind CSS, and Zustand.

## Stack

- **React 18** + **Vite** — fast dev and build
- **React Router v6** — client-side routing
- **Zustand** — lightweight state management
- **Tailwind CSS v3** — utility-first styling
- **TanStack Table** — powerful table primitives
- **Lucide React** — icon set
- **Recharts** — data visualization

## Getting Started

```bash
npm install
npm run dev
```

## Pages

| Route | Page |
|-------|------|
| `/` | Dashboard |
| `/projects` | Projects (Table + Kanban) |
| `/creators` | Creator cards grid |
| `/recruit` | Recruit requests & approval |
| `/tiering` | Coin-based tier system |
| `/persona` | Creator persona profile |

## Project Structure

```
src/
├── components/
│   ├── layout/     # Sidebar, Topbar
│   └── shared/     # Avatar, Badge, ProgressBar
├── pages/          # One file per route
├── store/          # Zustand stores
└── lib/            # Data, utilities, tier logic
```

