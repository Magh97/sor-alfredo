# DESIGN

Design tokens, colors, typography, spacing, layout. Source of truth: `docs/DESIGN_SYSTEM.md`.
Stack: React 19 + Vite + Tailwind 4.3 + shadcn/ui + lucide-react + Space Grotesk.

## shadcn/ui Config

```json
{ "style": "new-york", "baseColor": "neutral", "cssVariables": true, "prefix": "" }
```

## Philosophy

```
Personality:  El Artista       — poetic, sensory, imperfect (wabi-sabi digital)
Energy:       Café de Madrid   — warm, conversational, rhythmic
Structure:    Diario Personal  — free flow, 1-2° card rotations, margin notes
Materiality:  Tela y Hilo      — soft, sewn, organic, variable radii
Typography:   El Gritón        — bold Space Grotesk headings, warm body
Palette:      Mañana de Otoño  — terracotta, moss, cream, golden accents
```

## Colors

```
primary:            terracotta  oklch(0.55 0.15 38)     #c2572e
primary-light:      clay-light  oklch(0.68 0.16 42)     #e07a4d
primary-dark:       clay-dark   oklch(0.42 0.12 35)     #8c2b17
primary-foreground: parchment   oklch(0.97 0.02 80)     #fdfaf5

secondary:          moss        oklch(0.52 0.11 140)    #527a34
secondary-light:    moss-light  oklch(0.65 0.12 138)    #7b9a4f
secondary-dark:     moss-dark   oklch(0.40 0.09 135)    #3a4f24

background:         parchment   oklch(0.97 0.02 80)     #fdfaf5
surface:            linen       oklch(0.95 0.02 75)     #f8f0e2
surface-elevated:   linen-deep  oklch(0.93 0.02 72)     #efe3cc

text-primary:       espresso    oklch(0.20 0.03 45)     #2c1a10
text-secondary:     warm-brown  oklch(0.45 0.03 55)     #665448
text-muted:         muted-brown oklch(0.60 0.03 58)     #8a7e72

accent:             golden      oklch(0.72 0.16 75)     #e8a020
accent-foreground:  espresso    oklch(0.20 0.03 45)

success: deep-moss               #457a38     error: brick      #b5452e
warning: golden-amber            #d49224     info: dusty-blue   #4e769e
```

## Order Status → Color

```
draft:          muted-brown   bg-text-muted/15 text-text-secondary   icon: Pencil
in_kitchen:     golden-amber  bg-warning/15 text-warning             icon: CookingPot
ready:          dusty-blue    bg-info/15 text-info                   icon: CheckCircle
delivered:      muted-purple  bg-purple-200 text-purple-800          icon: Truck
paid:           deep-moss     bg-success/15 text-success             icon: Banknote
partially_paid: deep-orange   bg-orange-200 text-orange-700          icon: CreditCard
closed:         muted-brown   bg-text-muted/15 text-text-secondary   icon: Archive
```

## Table Status → Color

```
free:     bg-success/15 text-success border-success/30
occupied: bg-error/15   text-error   border-error/30
reserved: bg-warning/15 text-warning border-warning/30
cleaning: bg-info/15    text-info    border-info/30
```

## KDS Order Aging (Dark Theme)

```
<5 min:   border-kds-surface                  normal
5-10 min: border-accent animate-pulse          attention  (golden pulse)
10-15 min:border-warning animate-pulse         warning    + AlertTriangle
>15 min:  border-error animate-pulse bg-error/15 critical  + AlertTriangle
```

## Typography

```
Font:  Space Grotesk Bold (700) for ALL headings, KDS, buttons.
       system-ui for body text only.
Mono:  JetBrains Mono for prices, IDs, data.

Regular (organic scale):
  display:   3.815rem  heading-1: 2.441rem  heading-2: 1.953rem
  heading-3: 1.563rem  lead:      1.25rem   body:      1rem
  small:     0.875rem  caption:   0.75rem

KDS (Space Grotesk Bold on ALL text, legible at 2m):
  kds-sm:   24px    kds-base: 32px    kds-lg: 48px
  kds-xl:   64px    kds-2xl:  80px
```

## Spacing — Organic Scale

```
NOT standard Tailwind scale. Use these tokens:
  p-1: 4px    p-2: 8px    p-3: 14px   p-4: 20px
  p-5: 28px   p-6: 40px   p-7: 56px   p-8: 80px

Touch (mesero tablet): min 48x48px. Use p-4 (20px) or p-5 (28px) for buttons.
Click (desktop):       min 36x36px. Use p-3 (14px) or p-4 (20px).
KDS cards:             p-6 (40px) or p-7 (56px).
Gap between cards:     gap-3 (14px).
```

## Radii — Variable (like stitches)

```
controls (inputs, buttons): 4px   (--radius-control)
cards:                      16px  (--radius-card)
modals:                     24px  (--radius-modal)
chips/tags/badges:          full  (--radius-chip)
KDS cards:                  12px  (--radius-kds-card)
```

## Shadows — Warm (never black)

```
card:        0 2px 8px espresso/8%
card-hover:  0 4px 16px espresso/12%
modal:       0 16px 48px espresso/20%
toast:       0 4px 12px espresso/12%
kds-card:    0 4px 16px black/40%
```

## Icons

Library: lucide-react. Always individual import.

```
Mesero:        size-6 (24px, touch-friendly)
Cajero/Admin:  size-4 (16px, inline with text)
KDS:           size-8 (32px, visible at 2m)
Empty state:   size-12 (48px, decorative icon)
```

Rule: every icon-only button requires `aria-label`.

## Layouts

```
MESERO (tablet, touch):
  <div class="flex flex-col h-dvh bg-background">
    <header class="h-14 bg-surface border-b border-text-muted/10 flex items-center px-4 shrink-0">
      Title + UserMenu
    </header>
    <main class="flex-1 overflow-y-auto max-w-[960px] mx-auto w-full p-4">
      {content}
    </main>
    <nav class="h-16 bg-surface border-t border-text-muted/10 flex items-center justify-around shrink-0">
      {bottom nav items, min 48x48px touch targets}
    </nav>
  </div>

CAJERO & ADMIN (desktop):
  <div class="flex h-screen bg-background">
    <aside class="w-64 bg-surface border-r border-text-muted/10 flex flex-col shrink-0">
      <div class="h-14 px-5 border-b border-text-muted/10 flex items-center font-bold font-display">
        Alfredo's logo
      </div>
      <nav class="flex-1 py-4">{sidebar nav links, Space Grotesk}</nav>
      <div class="p-4 border-t border-text-muted/10">{UserMenu}</div>
    </aside>
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-14 bg-surface border-b border-text-muted/10 px-5 flex items-center shrink-0">
        <h1 class="heading-3 font-display font-bold">Page Title</h1>
      </header>
      <main class="flex-1 overflow-y-auto p-5">{content}</main>
    </div>
  </div>

KDS (32", dark theme, full-screen):
  <div class="h-screen bg-kds-bg flex flex-col overflow-hidden" data-kds>
    <header class="h-20 bg-kds-surface border-b border-kds-muted/20 px-8 flex items-center justify-between shrink-0">
      <span class="text-kds-lg font-display font-bold text-kds-text">Alfredo's Cocina</span>
      <span class="text-kds-base font-display text-kds-muted">{clock} · {count} activas</span>
    </header>
    <main class="flex-1 p-6 overflow-hidden">
      <div class="grid grid-cols-4 gap-4 h-full">
        {KDSOrderCard[]}
      </div>
    </main>
  </div>
```

## KDS Theme Tokens

```
bg:       espresso-black  oklch(0.08 0.01 40)
surface:  warm-dark-card  oklch(0.15 0.02 38)
text:     warm-cream      oklch(0.90 0.02 80)
accent:   terracotta-glow oklch(0.70 0.18 38)
muted:    muted-dark-text oklch(0.45 0.02 55)

Font: Space Grotesk Bold for EVERYTHING. No system-ui in KDS.

On mount:  requestFullscreen()
On mount:  navigator.wakeLock.request('screen')
CSS:       cursor: none

Animations:
  new order:  slide-from-top + scale bounce + terracotta glow, 500ms
  order done: slide-out right + fade + scale-down, 400ms
  aging pulse: animate-pulse (CSS) for warning/critical
```

## KDS Buttons

```
variant: kds
  bg-primary text-primary-foreground font-bold font-display
  shadow hover:bg-primary-light active:scale-95
  rounded-[var(--radius-control)]

size: kds
  h-14 text-kds-sm px-8 font-bold  (56px tall, 24px font)

size: kds-lg
  h-20 text-kds-lg px-12 font-bold (80px tall, 48px font)
```

## Empty, Loading, Error States — Anti-Slop

```
LOADING: Skeleton with "textile shimmer" (gradient: linen → golden → linen).
  Never spinner. Variants: skeleton-card (140px), skeleton-table-row (56px), skeleton-kds (280px).

EMPTY:
  <div class="flex flex-col items-center justify-center text-center p-8 text-text-muted gap-4">
    <Icon class="size-12 opacity-30 animate-[float_3s_ease-in-out_infinite]" />
    <h3 class="text-lead font-display font-semibold text-text-secondary">title with personality</h3>
    <p class="text-sm max-w-xs">description with poetic voice</p>
    {action && <Button variant="secondary">label</Button>}
  </div>

  KDS: Same structure but icon size-20 opacity-20, title text-kds-lg, desc text-kds-base.

ERROR:
  <div class="bg-error/10 border border-error/20 rounded-[var(--radius-card)] p-4 flex items-start gap-3">
    <AlertCircle class="size-5 text-error mt-0.5 shrink-0" />
    <div class="flex-1">
      <p class="text-sm font-display font-semibold text-error">Error</p>
      <p class="text-sm text-text-secondary mt-1">{message with personality}</p>
      {onRetry && <Button variant="secondary" size="sm" class="mt-3">Reintentar</Button>}
    </div>
  </div>

CRITICAL ANTI-SLOP RULES:
  NEVER "No data found"         → Use poetic empty states
  NEVER "Something went wrong"  → Use human error messages
  NEVER generic spinner         → Use textile shimmer skeleton
  NEVER black (#000) anywhere   → Use espresso (#2c1a10)
  NEVER white (#fff) background → Use parchment (#fdfaf5)
  NEVER uniform 8px radii       → Variable: 4px controls, 16px cards, 24px modals, full chips
  NEVER system-ui for headings  → Space Grotesk Bold required
  NEVER cards without rotation  → 1-2° rotations on mesero card grids
```

## Animation Tokens

```
micro-interactions: 150-200ms ease-out
page transitions:   300-400ms cubic-bezier(0.4, 0, 0.2, 1)
bounce:             cubic-bezier(0.34, 1.56, 0.64, 1)
card enter:         scale 0.95→1 + fade, 200ms, stagger 50ms
modal open:         scale 0.92→1 + fade + overshoot, 300ms
button hover:       scale 1.02, 150ms
button press:       scale 0.97, 100ms
```

## Card Rotation (Mesero grids)

```css
/* Apply via nth-child for "diario personal" feel */
.card:nth-child(odd)  { transform: rotate(0.6deg); }
.card:nth-child(even) { transform: rotate(-0.4deg); }
```

Use `cardRotation(index)` from `@/lib/utils`:

```typescript
export function cardRotation(index: number): string {
  const rotations = [0.6, -0.4, 0.3, -0.7, 0.9, -0.5, 0.2, -0.8];
  return `rotate(${rotations[index % rotations.length]}deg)`;
}
```

## Accessibility Checklist

```
Touch target min 48x48px                         (mesero: required, desktop: recommended)
Color contrast ratio 4.5:1                       (all screens)
Focus visible (keyboard nav)                     (desktop: required, tablet: N/A)
aria-label on icon-only buttons                  (always)
Screen reader announcements via aria-live         (status changes: polite, new KDS orders: assertive)
role attributes on custom controls               (role="button", role="listbox")
reduced-motion support                           (always: @media prefers-reduced-motion)
```
