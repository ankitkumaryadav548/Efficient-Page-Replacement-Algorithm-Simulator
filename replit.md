# Workspace

## Overview

Full-stack pnpm monorepo — **Efficient Page Replacement Algorithm Simulator**.

A web application that simulates FIFO, LRU, and Optimal page replacement algorithms with step-by-step visualization, page fault highlighting, and bar chart comparisons.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui, recharts)
- **Database**: PostgreSQL + Drizzle ORM (not used by this app — no persistent data needed)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- **page-replacement-simulator** (`/`) — React+Vite frontend simulator UI
- **api-server** (`/api`) — Express backend with FIFO, LRU, Optimal algorithms

## Key Endpoints

- `POST /api/simulate` — Run page replacement simulation
  - Input: `{ referenceString, frames, algorithm: "FIFO"|"LRU"|"Optimal"|"ALL" }`
  - Output: step-by-step results with page fault/hit stats per algorithm

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/page-replacement-simulator run dev` — run frontend locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
