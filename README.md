# TypeScript Refactoring Demo Repository

A demo TypeScript project designed to test IDE refactoring tools like "Find Implementations", "Find References", "Rename Symbol", and cross-project navigation.

## Structure

```
ts-repo-test/
├── src/                      # Phase 1: Single-project demo
│   ├── core/                 # Base types and utilities
│   │   ├── types.ts          # Interfaces: Entity, Repository, etc.
│   │   ├── utils.ts          # Utility functions
│   │   └── index.ts          # Barrel export
│   ├── models/               # Domain models
│   │   ├── user.ts           # User model implementing Entity
│   │   ├── product.ts        # Product model implementing Entity
│   │   └── index.ts          # Barrel export
│   ├── services/             # Business logic
│   │   ├── userService.ts    # User service
│   │   ├── productService.ts # Product service
│   │   └── index.ts          # Barrel export
│   ├── api/                  # API handlers
│   │   ├── handlers.ts       # Request handlers
│   │   └── index.ts          # Barrel export
│   └── index.ts              # Main entry point
│
├── packages/                     # Phase 2: Multi-project demo
│   ├── tsconfig.packages.json    # Shared config with paths
│   │
│   ├── shared/                   # Shared types and utilities
│   │   ├── tsconfig.json         # Composite project config
│   │   ├── types.ts              # Shared DTOs and interfaces
│   │   ├── utils.ts              # Shared utility functions
│   │   ├── validation.ts         # Shared validation
│   │   └── index.ts              # Barrel export
│   │
│   ├── backend/                  # Backend project (references shared)
│   │   ├── tsconfig.json         # References shared project
│   │   ├── models.ts             # Backend-specific models
│   │   ├── repository.ts         # Repository implementations
│   │   ├── services.ts           # Backend services
│   │   └── index.ts              # Barrel export
│   │
│   └── frontend/                 # Frontend project (references shared)
│       ├── tsconfig.json         # References shared project
│       ├── types.ts              # Frontend-specific types
│       ├── api.ts                # API client
│       ├── state.ts              # State management
│       └── index.ts              # Barrel export
│
├── tsconfig.base.json        # Shared compiler options
├── tsconfig.single.json      # Phase 1 config
├── tsconfig.json             # Default (points to single project)
└── tsconfig.projects.json    # Phase 2 config (project references)
```

## Building

```bash
# Install dependencies
npm install

# Build Phase 1 (single project)
npm run build:single

# Build Phase 2 (project references)
npm run build:projects

# Build everything
npm run build

# Type check without emitting
npm run typecheck

# Clean build artifacts
npm run clean
```

## Refactoring Test Scenarios

### Phase 1: Single Project (`src/`)

1. **Find Implementations**
   - Click on `Entity` interface in `core/types.ts`
   - Use "Find Implementations" to see `User` and `Product` models

2. **Find References**
   - Click on `generateId()` in `core/utils.ts`
   - Use "Find References" to see all call sites

3. **Rename Symbol**
   - Rename `UserRole` enum in `models/user.ts`
   - Watch all usages update automatically

4. **Rename Package**
   - Rename `models` directory to `entities`
   - Update all import paths

5. **Go to Definition**
   - Click on any imported type/function
   - Navigate to the source definition

### Phase 2: Project References (`packages/`)

1. **Cross-Project Find Implementations**
   - Click on `SharedEntity` in `packages/shared/src/types.ts`
   - Find implementations in both `backend` and `frontend`

2. **Cross-Project Find References**
   - Click on `createSuccess()` in `packages/shared/src/utils.ts`
   - See usages across all three packages

3. **Cross-Project Rename**
   - Rename `UserDto` interface in `packages/shared/src/types.ts`
   - Watch updates in both `backend` and `frontend`

4. **Cross-Project Go to Definition**
   - In `backend/src/services.ts`, click on `validateUserDto`
   - Navigate to `shared/src/validation.ts`

### Expected Limitations with Project References

- Some refactorings may only work within a single project
- Renaming files/directories across projects may require manual import updates
- IDE may need to rebuild project references after changes
- Ensure `composite: true` is set in each package's tsconfig

## Configuration Details

### IDE Intelligence Features Enabled

- `declaration: true` - Generates .d.ts files
- `declarationMap: true` - Enables "Go to Definition" for declarations
- `sourceMap: true` - Enables debugging
- `composite: true` - Enables project references
- Strict type checking for better error detection

### Path Aliases (Phase 1)

```json
{
  "paths": {
    "@core/*": ["core/*"],
    "@services/*": ["services/*"],
    "@models/*": ["models/*"],
    "@api/*": ["api/*"]
  }
}
```

### Project References (Phase 2)

Each project extends a common config with path mappings:

```json
// packages/tsconfig.packages.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "shared/*": ["shared/*"],
      "backend/*": ["backend/*"],
      "frontend/*": ["frontend/*"]
    }
  }
}
```

Each project declares its dependencies via project references:

```json
// packages/backend/tsconfig.json
{
  "extends": "../tsconfig.packages.json",
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "../shared" }
  ]
}
```

Imports use package-style paths that resolve to source files:

```typescript
// packages/backend/models.ts
import type { UserDto } from 'shared/types';
import { createEntityFields } from 'shared/utils';
```

The project references ensure proper build order - `tsc --build` compiles `shared` first, then `backend` and `frontend`. The `declarationMap` option enables "Go to Definition" to navigate to source files.

## TypeScript Version

This project requires TypeScript 5.3.3 or later.
