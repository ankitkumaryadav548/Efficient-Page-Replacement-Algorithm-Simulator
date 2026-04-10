# Workspace

## Overview

Full-stack pnpm monorepo — **Efficient Page Replacement Algorithm Simulator**.

A web application that simulates FIFO, LRU, and Optimal page replacement algorithms with step-by-step visualization, page fault highlighting, and bar chart comparisons.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui, recharts)
- **Backend**: Java 19 + Spring Boot 3.2.5 (Maven)
- **Validation**: Spring Validation (Jakarta), Zod on frontend
- **API codegen**: Orval (from OpenAPI spec)

## Artifacts

- **page-replacement-simulator** (`/`) — React+Vite frontend simulator UI
- **api-server** (`/api`) — Java Spring Boot backend (Maven project at `java-backend/`)

## Java Backend Structure

```
java-backend/
  pom.xml
  src/main/java/com/simulator/pageReplacement/
    PageReplacementApplication.java          # Spring Boot entry point
    model/
      SimulationRequest.java                 # Request DTO with validation
      SimulationStep.java                    # Frame state per step
      AlgorithmResult.java                   # Algorithm result with stats
      SimulationResponse.java                # Full API response
    service/
      PageReplacementService.java            # FIFO, LRU, Optimal implementations
    controller/
      SimulationController.java              # REST endpoints
      GlobalExceptionHandler.java            # Validation error handling
```

## Key Endpoints

- `GET /api/healthz` — Health check
- `POST /api/simulate` — Run page replacement simulation
  - Input: `{ referenceString: "7 0 1 2 0 3 0 4", frames: 3, algorithm: "FIFO"|"LRU"|"Optimal"|"ALL" }`
  - Output: step-by-step results with pageFaults, pageHits, hitRatio, faultRatio per algorithm

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/page-replacement-simulator run dev` — run frontend locally
- `cd java-backend && mvn clean package -DskipTests` — rebuild Java backend JAR

See the `pnpm-workspace` skill for workspace structure details.
