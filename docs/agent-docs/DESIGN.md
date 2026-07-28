# DESIGN

Design tokens, colors, typography, spacing, layout. Use these values directly.

## shadcn/ui Config

```json
{ "style": "new-york", "baseColor": "neutral", "cssVariables": true, "prefix": "" }
```

## Colors

```
primary:           amber-600    oklch(0.705 0.2 62)
primary-light:     amber-400    oklch(0.87 0.15 75)
primary-dark:      amber-800    oklch(0.55 0.18 55)
primary-foreground:white

accent:            green-600    oklch(0.65 0.2 142)
accent-foreground: white

success: green-500     error: red-600     warning: amber-500     info: blue-500
```

## Order Status → Color

```
draft:          gray-400    bg-gray-100 text-gray-700     icon: ClipboardList
in_kitchen:     amber-500   bg-amber-100 text-amber-800   icon: CookingPot
ready:          blue-500    bg-blue-100 text-blue-800     icon: CheckCircle
delivered:      purple-500  bg-purple-100 text-purple-800 icon: Truck
paid:           green-500   bg-green-100 text-green-800   icon: Banknote
partially_paid: orange-500  bg-orange-100 text-orange-800 icon: CreditCard
closed:         gray-500    bg-gray-100 text-gray-700     icon: Archive
```

## Table Status → Color

```
free:     bg-green-100 text-green-800 border-green-300
occupied: bg-red-100   text-red-800   border-red-300
reserved: bg-amber-100 text-amber-800 border-amber-300
cleaning: bg-blue-100  text-blue-800  border-blue-300
```

## KDS Order Aging

```
<5 min:   border-neutral-700              normal
5-10 min: border-amber-500                attention
10-15 min:border-orange-500 animate-pulse warning
>15 min:  border-red-600   animate-pulse  critical  + AlertTriangle icon
```

## Typography

Regular scale:
```
xs:12px  sm:14px  base:16px  lg:18px  xl:20px  2xl:24px  3xl:30px  4xl:36px
```

KDS scale (min 24px):
```
kds-sm:24px  kds-base:32px  kds-lg:48px  kds-xl:64px  kds-2xl:80px
```

Font family: `system-ui, -apple-system, sans-serif`

## Spacing

Standard Tailwind spacing scale.

```
Touch (mesero tablet): min 48x48px target. Use p-3, p-4, gap-4.
Click (desktop):       min 32x32px target. Use p-2, p-3, gap-3.
KDS cards:             p-6 or p-8 for legibility at distance.
```

## Radius

```
sm: 0.25rem    md: 0.375rem    lg: 0.5rem    xl: 0.75rem
```

## Shadows

```
card:  0 1px 3px rgba(0,0,0,0.1)
modal: 0 20px 60px rgba(0,0,0,0.3)
kds:   0 4px 12px rgba(0,0,0,0.5)
```

## Icons

Library: lucide-react
Import: `import { Send } from 'lucide-react'` (always individual)

Sizes:
```
Mesero:        size-6 (24px, touch-friendly)
Cajero/Admin:  size-4 (16px, inline with text)
KDS:           size-8 (32px, visible at 2m distance)
```

Rule: every icon-only button requires `aria-label`.

## Layouts

```
MESERO (tablet, touch):
  <div class="flex flex-col h-dvh bg-neutral-50">
    <main class="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
      {content}
    </main>
    <nav class="h-16 bg-white border-t flex items-center justify-around shrink-0">
      {bottom nav items, 64x64px touch targets}
    </nav>
  </div>

CAJERO & ADMIN (desktop):
  <div class="flex h-screen bg-neutral-50">
    <aside class="w-64 bg-white border-r flex flex-col shrink-0">
      <div class="h-16 px-6 border-b">SOR logo</div>
      <nav class="flex-1 py-4">{sidebar items}</nav>
    </aside>
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b px-6 shrink-0">{UserMenu}</header>
      <main class="flex-1 overflow-y-auto p-6">{content}</main>
    </div>
  </div>

KDS (32", dark theme, full-screen):
  <div class="h-screen bg-neutral-950 flex flex-col overflow-hidden" data-kds>
    <header class="h-20 bg-neutral-900 border-b border-neutral-800 px-8 shrink-0">
      {clock} {order count}
    </header>
    <main class="flex-1 p-4 overflow-hidden">
      <div class="grid grid-cols-4 gap-4 h-full">
        {KDSOrderCard[]}
      </div>
    </main>
  </div>
```

## KDS Theme Tokens

```
bg:       neutral-950
card bg:  neutral-900
card border: neutral-700 (base), variable by aging
text:     neutral-50
accent:   amber-400
header:   neutral-900
button:   amber-600  (bg), amber-500 (hover), white (text)

On mount:  requestFullscreen()
On mount:  navigator.wakeLock.request('screen')
CSS:       cursor: none
Animations:
  new order:     scale-in + amber pulse, 300ms
  order ready:   slide-out + fade, 500ms
  aging pulse:   animate-pulse (CSS)
```

## KDS Button (shadcn extension)

```
variant: kds
  bg-amber-600 text-white shadow hover:bg-amber-500 active:scale-95

size: kds
  h-14 rounded-xl px-8 text-kds-sm font-bold (56px tall, 24px font)

size: kds-lg
  h-20 rounded-xl px-12 text-kds-lg font-bold (80px tall, 48px font)
```

## Empty, Loading, Error States

```
LOADING: Skeleton matching target card dimensions. Never spinner.
  <div class="grid gap-3">
    {Array(4).map(() => <Card><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-48" /></Card>)}
  </div>

EMPTY (default):
  <div class="flex flex-col items-center justify-center text-center p-8 text-neutral-400 gap-4">
    <Icon class="size-16 opacity-30" />
    <h3 class="text-lg font-semibold text-neutral-500">title</h3>
    <p class="text-sm max-w-xs">description</p>
    {action && <Button variant="outline">label</Button>}
  </div>

EMPTY (KDS):
  Same structure but: text-neutral-500 gap-6, icon size-20 opacity-20, title text-kds-lg, desc text-kds-base

ERROR:
  <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
    <AlertCircle class="size-5 text-red-500 mt-0.5 shrink-0" />
    <div class="flex-1">
      <p class="text-sm font-medium text-red-800">Error</p>
      <p class="text-sm text-red-600 mt-1">{message}</p>
      {onRetry && <Button variant="outline" size="sm" class="mt-3">Reintentar</Button>}
    </div>
  </div>
```

## Accessibility Checklist

```
Touch target min 48x48px                            (mesero: required, desktop: recommended)
Color contrast ratio 4.5:1                          (all screens)
Focus visible (keyboard nav)                        (desktop: required, tablet: N/A)
aria-label on icon-only buttons                     (always)
Screen reader announcements via aria-live            (status changes: polite, new KDS order: assertive)
role attributes on custom controls                  (role="button", role="listbox")
sr-only for hidden screen-reader text               (always)
reduced-motion support                              (always: @media prefers-reduced-motion)
```
