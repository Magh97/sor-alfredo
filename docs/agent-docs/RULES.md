# RULES

Apply these before every file edit. Violations fail review.

## ALWAYS

```
// STRICT MODE
TypeScript strict mode. No `any` except third-party type wrappers.
Zod for all API input validation. Schema co-located: <module>.schema.ts.

// ARCHITECTURE
Controller → Service → Repository. Never skip layers.
  Controller: parse req, call service, return { data } or { error }.
  Service: business logic only. Never touches req/res.
  Repository: Drizzle queries only. Returns entities, never HTTP types.
Use restaurant_id filter on every query. Helper: `whereRestaurant(db, restaurantId)`.
Architecture decisions documented in `docs/adr/`. Check ADRs before changing stack, auth, or realtime patterns.

// DATA TYPES
NUMERIC(19,4) for all money fields. Never FLOAT/REAL for money.
TIMESTAMPTZ for all timestamps. Never TIMESTAMP WITHOUT TIME ZONE.

// STYLING
Tailwind classes only. No inline styles, no CSS modules, no styled-components.
shadcn/ui primitives as base. Custom components import from @/components/ui/.
cn() from @/lib/utils for conditional classes. Never string concatenation.
lucide-react icons imported individually. Never barrel import.
Space Grotesk Bold (700) for ALL headings, buttons, KDS text. system-ui for body only.
Organic spacing scale: p-3=14px, p-4=20px, p-5=28px, p-6=40px. NOT standard Tailwind.
48px min touch target on mesero tablet screens. Use p-4 or larger.
KDS screens: Space Grotesk Bold on ALL text. No system-ui. text-kds-sm (24px) or larger.
Variable radii: control=4px, card=16px, modal=24px, chip=full, KDS=12px.
Cards in mesero grids: apply cardRotation(index) for 1-2° rotation ("diario personal" effect).
Warm shadows only: use espresso tint, never black.
Background: parchment (#fdf6ec). Never white (#fff). Never black (#000).
Empty states: poetic microcopy with personality. NEVER "No data found".
Error states: human messages with personality. NEVER "Something went wrong".
Loading states: textile shimmer skeleton (linen→golden→linen gradient). NEVER generic spinner.
Design source of truth: docs/DESIGN_SYSTEM.md. All UI MUST reference it.

// ACCESSIBILITY
aria-label on every icon-only button, link, or interactive element.
role attributes on custom controls (role="button", role="listbox").
aria-live="polite" for dynamic content (status changes).
aria-live="assertive" for KDS new order announcements.

// REACT PATTERNS
Early returns for states:
  isLoading → <Skeleton />
  isError → <ErrorAlert message={error.message} onRetry={refetch} />
  !data || data.length===0 → <EmptyState icon={...} title="..." />
Named exports only. No default exports. No React.FC.
Compound components via Context: Card.Header, Card.Body, Card.Footer.

// TESTING
Co-located tests: <name>.test.ts next to source.
AAA pattern: describe → it → // Arrange // Act // Assert.

// FILE ORGANIZATION
Components: PascalCase.tsx
Hooks: camelCase, use- prefix
Utils: camelCase
Schema: <module>.schema.ts
Tests: <file>.test.ts
```

## NEVER

```
// TYPES
No `any` type.
No React.FC. Use `function Component(props: Props)` with typed return.
No enums. Use `as const` string unions: `const ROLES = ['waiter','cashier','admin'] as const; type Role = typeof ROLES[number];`

// IMPORTS
No barrel exports (index.ts re-exporting everything).
No relative imports beyond ../../. Use @/ path alias or @server/.
No `import *` for lucide-react. Always named: `import { Send } from 'lucide-react'`.

// CODE QUALITY
No console.log in production code. Use structured logger.
No raw SQL in services. All queries go through repository.
No `||` for defaults. Use `??` (nullish coalescing).
No `!` non-null assertions. Proper null checks.

// REACT
No default exports.
No inline styles or `<style>` tags.
No `.env` files in git. Secrets via environment variables only.
No barrel imports (`import * from './components'`).

// DATA
No deleting rows that have FK references. Use soft delete (is_active=false).
No skipping restaurant_id in queries. Always scoped to current restaurant.

// ANIMATIONS
No spinners. Textile shimmer skeleton only.
No ease-in for UI elements. Use ease-out or cubic-bezier(0.34, 1.56, 0.64, 1) for bounce.
No animating from scale(0). Start at scale(0.9) or scale(0.95).
No motion for users with prefers-reduced-motion.
Micro-interactions: 150-200ms. Page transitions: 300-400ms.
Button hover: scale 1.02. Button press: scale 0.97.
KDS new order: slide+scale+bounce+terracotta pulse, 500ms.
KDS order done: slide-out+fade+scale-down, 400ms.

// SECURITY
No secrets in code, config files, or logs.
No exposing stack traces in error responses.
No storing JWT or passwords in localStorage (use httpOnly cookies or memory).
```
