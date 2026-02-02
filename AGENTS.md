# AGENTS.md - Coding Guidelines for Pinger

## Build, Test, and Lint Commands

```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run serve

# Run all tests
npm run test

# Run a single test file
npx vitest run src/path/to/file.test.ts

# Run tests in watch mode during development
npx vitest --watch

# Format code
npm run format

# Lint code
npm run lint

# Check (format + lint + auto-fix)
npm run check

# Database migrations
npx drizzle-kit generate  # Generate migration
npx drizzle-kit migrate   # Run migrations
npx drizzle-kit push      # Push schema changes (dev only)
```

## Code Style Guidelines

### Import Conventions
- Use `@/` path alias for all src imports (configured in tsconfig.json)
- Import order: React/core libs → third-party → @/lib → @/components → relative
- Use named imports where possible

### Formatting (Biome)
- Indent: 4 spaces (no tabs)
- Quotes: Double
- Semicolons: As needed
- Trailing commas: None
- Organize imports: Enabled (automatic sorting)

### Naming Conventions
- **Components**: PascalCase (e.g., `Header`, `UserButton`)
- **Functions/Variables**: camelCase (e.g., `getCurrentUser`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Files**: camelCase for utils, PascalCase for components
- **Database**: Plural table names (e.g., `users`, `friendships`)

### TypeScript Guidelines
- Strict mode enabled
- Use `type` for type-only imports
- No non-null assertions (override in biome config, but avoid)
- No unused locals/parameters

### Component Patterns
- Server functions: `createServerFn` from `@tanstack/react-start`
- Client components: Import from `@tanstack/react-router`
- Always use Tailwind classes (no inline styles)
- Use `cn()` utility for conditional classes

### Server Functions Pattern
```typescript
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const myFunction = createServerFn({ method: "GET" }).handler(async () => {
    const request = getRequest();
    // Logic here
});
```

### Database Schema Pattern
```typescript
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["pending", "accepted"]);

export const tableName = pgTable("table_name", {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow()
});
```

### Error Handling
- Return null for missing data in loaders
- Use 404 components for route-level not found
- Better Auth handles auth errors automatically
- Server functions return serializable data

### Database & Auth
- **Database**: Drizzle ORM with PostgreSQL
- **Auth**: Better Auth with @daveyplate/better-auth-ui
- Use `auth.api.getSession()` with request headers
- Session endpoint at `/api/auth`

### Routing
- File-based routing with TanStack Router
- Route files in `src/routes/` using `createFileRoute()`
- Route tree auto-generated at `src/routeTree.gen.ts`
- Root layout in `src/routes/__root.tsx`
- Use `beforeLoad` for auth redirects: `throw redirect({ to: "/" })`

### Styling
- **Tailwind CSS v4** with custom theme variables
- Use `bg-background`, `text-foreground` for theme colors
- Mobile-first responsive design
- Touch targets minimum 44px
- Container: `container mx-auto` for consistent width

### Environment Variables
- Use `process.env.DATABASE_URL` for database
- No secrets in client-side code

### Testing
- **Vitest** for unit testing
- Testing Library for React components
- Tests alongside source files (e.g., `file.test.ts`)

### PWA Configuration
- Service worker via vite-plugin-pwa
- Icons: 192x192 and 512x512 PNG
- Theme colors: `#5865f2` (primary)

### Git & CI/CD
- Conventional commits for semantic-release
- GitHub Actions in `.github/workflows/`
- Docker image published to GHCR
- Never commit `.env` files

### Important Notes
- Run `npm run check` before committing
- Generated files (routeTree.gen.ts) should not be manually edited
- Date formatting: Use explicit locale to avoid hydration errors:
  `toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })`
