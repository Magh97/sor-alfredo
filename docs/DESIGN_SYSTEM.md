# Design System: SOR

> **Última actualización:** 2026-07-28
> **Stack:** React 19 + Vite + Tailwind CSS 4.3 + shadcn/ui + lucide-react
> **Fuente de verdad:** Esta biblia rige TODA la generación de código visual.

---

## 1. Filosofía de Diseño

- **Personalidad:** El Artista — Poética, sensorial, imperfecta. Cada pantalla es una página de cuaderno de bocetos. El microcopy usa metáforas sensoriales, descripciones íntimas. Wabi-sabi digital: la imperfección intencional es un feature.
- **Energía:** Café de Madrid — Animada, conversacional, cálida. Interacciones con ritmo y rebote suave, como un mesero que te conoce por nombre. No hay prisa, pero sí flujo.
- **Materialidad:** Tela y Hilo — Suave, cosida, orgánica. Superficies de tela digital, esquinas variables como costuras, sombras cálidas como luz de ventana.
- **Anti-Slop Statement:** "Esta app NUNCA usará gradientes púrpura/azul genéricos de AI, spinners de carga sin personalidad, 'Something went wrong' como error state, paleta de grises fríos sin punto de vista, corners uniformes de 8px en todo, layouts simétricos de 12-columnas, Inter o Roboto como fuente principal, cards-centradas-con-3-features-debajo, ni animaciones fade-in sin dirección."

---

## 2. Paleta de Color — Mañana de Otoño

### 2.1 Tokens CSS (Tailwind v4 `@theme`)

```css
@theme {
  /* === Brand === */
  --color-primary: oklch(0.52 0.18 38);              /* terracotta    #c2572e */
  --color-primary-light: oklch(0.65 0.18 42);         /* clay-light    #e07a4d */
  --color-primary-dark: oklch(0.40 0.14 33);          /* clay-dark     #8c2b17 */
  --color-primary-foreground: oklch(0.985 0.005 85);  /* warm-white    #fdfaf5 */

  /* === Secondary (Moss Green) === */
  --color-secondary: oklch(0.50 0.12 140);            /* moss          #527a34 */
  --color-secondary-light: oklch(0.63 0.13 138);      /* moss-light    #7b9a4f */
  --color-secondary-dark: oklch(0.38 0.10 135);       /* moss-dark     #3a4f24 */
  --color-secondary-foreground: oklch(0.985 0.005 85);

  /* === Background === */
  --color-background: oklch(0.985 0.005 85);          /* warm-white    #fdfaf5 */
  --color-surface: oklch(0.97 0.015 80);              /* linen         #f8f0e2 */
  --color-surface-elevated: oklch(0.95 0.02 75);      /* linen-deep    #efe3cc */

  /* === Text === */
  --color-text-primary: oklch(0.20 0.03 45);          /* deep-espresso #2c1a10 */
  --color-text-secondary: oklch(0.40 0.03 50);        /* warm-brown    #665448 */
  --color-text-muted: oklch(0.55 0.02 55);            /* muted-brown   #8a7e72 */

  /* === Accent (Golden) === */
  --color-accent: oklch(0.72 0.18 78);                /* golden        #e8a020 */
  --color-accent-foreground: oklch(0.20 0.03 45);     /* deep-espresso #2c1a10 */

  /* === Semantic === */
  --color-success: oklch(0.46 0.12 140);              /* deep-moss     #457a38 */
  --color-error: oklch(0.45 0.16 25);                 /* deep-brick    #b5452e */
  --color-warning: oklch(0.63 0.16 72);               /* golden-amber  #d49224 */
  --color-info: oklch(0.50 0.07 240);                 /* dusty-blue    #4e769e */

  /* === Order Status (7 states) === */
  --color-order-draft: oklch(0.60 0.03 58);           /* muted-brown   */
  --color-order-in-kitchen: oklch(0.65 0.16 72);      /* golden-amber  */
  --color-order-ready: oklch(0.52 0.06 240);          /* dusty-blue    */
  --color-order-delivered: oklch(0.42 0.08 300);      /* muted-purple  */
  --color-order-paid: oklch(0.48 0.10 140);           /* deep-moss     */
  --color-order-partially-paid: oklch(0.58 0.17 48);   /* deep-orange   */
  --color-order-closed: oklch(0.50 0.03 55);          /* warm-gray     */

  /* === Table Status === */
  --color-table-free: oklch(0.48 0.10 140);           /* deep-moss     */
  --color-table-occupied: oklch(0.48 0.15 25);        /* brick         */
  --color-table-reserved: oklch(0.65 0.14 72);        /* golden-amber  */
  --color-table-cleaning: oklch(0.52 0.06 240);       /* dusty-blue    */

  /* === Payment Methods === */
  --color-payment-cash: oklch(0.48 0.10 140);
  --color-payment-card: oklch(0.52 0.06 240);
  --color-payment-transfer: oklch(0.42 0.08 300);

  /* === User Role Badges === */
  --color-role-waiter: oklch(0.52 0.06 240);          /* dusty-blue    */
  --color-role-cashier: oklch(0.48 0.10 140);         /* deep-moss     */
  --color-role-admin: oklch(0.55 0.15 38);            /* terracotta    */
  --color-role-superadmin: oklch(0.48 0.15 25);       /* brick         */

  /* === KDS Dark Theme === */
  --color-kds-bg: oklch(0.08 0.01 40);               /* espresso-black (not pure) */
  --color-kds-surface: oklch(0.14 0.02 38);           /* warm-dark-card  */
  --color-kds-text: oklch(0.95 0.01 85);             /* warm-cream      */
  --color-kds-accent: oklch(0.70 0.20 40);            /* terracotta-glow */
  --color-kds-muted: oklch(0.42 0.03 55);            /* muted-dark-text */

  /* === Radii (Variable - "costuras") === */
  --radius-control: 0.25rem;                          /* 4px  inputs, buttons */
  --radius-card: 1rem;                                /* 16px tarjetas */
  --radius-modal: 1.5rem;                             /* 24px modales, drawers */
  --radius-chip: 9999px;                              /* full  chips, tags, badges */
  --radius-kds-card: 0.75rem;                         /* 12px KDS cards */

  /* === Shadows (Cálidas, no duras) === */
  --shadow-card: 0 2px 8px oklch(0.20 0.03 45 / 0.10);
  --shadow-card-hover: 0 4px 16px oklch(0.20 0.03 45 / 0.15);
  --shadow-modal: 0 16px 48px oklch(0.20 0.03 45 / 0.22);
  --shadow-toast: 0 4px 12px oklch(0.20 0.03 45 / 0.14);
  --shadow-kds-card: 0 4px 16px oklch(0 0 0 / 0.40);

  /* === Typography Scale (non-standard, organic) === */
  --font-size-display: 3.815rem;     /* h1 hero       */
  --font-size-heading-1: 2.441rem;   /* h2            */
  --font-size-heading-2: 1.953rem;   /* h3            */
  --font-size-heading-3: 1.563rem;   /* h4            */
  --font-size-lead: 1.25rem;         /* lead paragraph */
  --font-size-body: 1rem;            /* base          */
  --font-size-small: 0.875rem;       /* secondary     */
  --font-size-caption: 0.75rem;      /* captions      */

  /* KDS Scale (legible a 2m en monitor 32") */
  --font-size-kds-sm: 1.5rem;        /* 24px  item details  */
  --font-size-kds-base: 2rem;        /* 32px  order items   */
  --font-size-kds-lg: 3rem;          /* 48px  table number  */
  --font-size-kds-xl: 4rem;          /* 64px  order ID      */
  --font-size-kds-2xl: 5rem;         /* 80px  timer/aging   */
}
```

### 2.2 Tabla de Referencia de Color

| Token | Hex | OKLCH | Uso |
|-------|-----|-------|-----|
| `primary` | `#c2572e` | `oklch(0.55 0.15 38)` | Botones principales, CTAs, links, foco |
| `primary-light` | `#e07a4d` | `oklch(0.68 0.16 42)` | Hover states, fondos suaves |
| `primary-dark` | `#8c2b17` | `oklch(0.42 0.12 35)` | Active/pressed states |
| `secondary` | `#527a34` | `oklch(0.52 0.11 140)` | Acentos secundarios, iconos |
| `background` | `#fdfaf5` | `oklch(0.97 0.02 80)` | Fondo general |
| `surface` | `#f8f0e2` | `oklch(0.95 0.02 75)` | Tarjetas, paneles |
| `text-primary` | `#2c1a10` | `oklch(0.20 0.03 45)` | Títulos, párrafos |
| `text-secondary` | `#665448` | `oklch(0.45 0.03 55)` | Metadatos, subtítulos |
| `accent` | `#e8a020` | `oklch(0.72 0.16 75)` | Highlights, badges, activos |
| `success` | `#457a38` | `oklch(0.48 0.10 140)` | Confirmaciones, pagos completados |
| `error` | `#b5452e` | `oklch(0.48 0.15 25)` | Errores (con calidez, no agresivo) |
| `warning` | `#d49224` | `oklch(0.65 0.14 72)` | Advertencias, aging < 10min |
| `info` | `#4e769e` | `oklch(0.52 0.06 240)` | Información contextual |

---

## 3. Tipografía

### 3.1 Fuentes

| Rol | Fuente | Peso | Uso |
|-----|--------|------|-----|
| **Display/Heading** | `'Space Grotesk', system-ui, sans-serif` | 700 | H1-H4, hero text, KDS orders |
| **Body** | `system-ui, -apple-system, 'Segoe UI', sans-serif` | 400 | Párrafos, labels, inputs |
| **Lead** | `'Space Grotesk', system-ui, sans-serif` | 500 | Párrafos destacados, CTAs |
| **Mono** | `'JetBrains Mono', 'Fira Code', monospace` | 400 | Datos, precios, IDs de orden |

> **Importación Google Fonts:** `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');`
> **Variable font:** Si, Space Grotesk es variable (weight axis 300-700).
> **Fallback chain para headings negrita:** `'Space Grotesk', 'Inter', system-ui, sans-serif`

### 3.2 Escala Tipográfica

| Token | Tamaño | Line-height | Letter-spacing | Uso |
|-------|--------|-------------|----------------|-----|
| `display` | 3.815rem (61px) | 1.1 | -0.02em | H1, hero (solo admin/KDS) |
| `heading-1` | 2.441rem (39px) | 1.2 | -0.015em | H2, títulos de página |
| `heading-2` | 1.953rem (31px) | 1.25 | -0.01em | H3, títulos de sección |
| `heading-3` | 1.563rem (25px) | 1.3 | -0.005em | H4, títulos de tarjeta |
| `lead` | 1.25rem (20px) | 1.5 | 0 | Párrafos introductorios |
| `body` | 1rem (16px) | 1.55 | 0 | Body text |
| `small` | 0.875rem (14px) | 1.5 | 0 | Metadatos, etiquetas |
| `caption` | 0.75rem (12px) | 1.4 | 0.01em | Captions, timestamps |

### 3.3 KDS Scale

| Token | Tamaño | Line-height | Peso | Uso |
|-------|--------|-------------|------|-----|
| `kds-sm` | 1.5rem (24px) | 1.3 | 500 | Detalles de items |
| `kds-base` | 2rem (32px) | 1.2 | 700 | Items de orden |
| `kds-lg` | 3rem (48px) | 1.1 | 700 | Número de mesa |
| `kds-xl` | 4rem (64px) | 1.0 | 700 | ID de orden |
| `kds-2xl` | 5rem (80px) | 1.0 | 700 | Timer de aging |

> **Regla:** Todos los KDS headings usan `Space Grotesk Bold` (700). Body en KDS usa `Space Grotesk Medium` (500). No usar system-ui en KDS; la tipografía bold es parte central de la identidad.

---

## 4. Espaciado — Escala Orgánica

### 4.1 Tokens de Espaciado

```css
@theme {
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px   */
  --spacing-2: 0.5rem;    /* 8px   */
  --spacing-3: 0.875rem;  /* 14px  ─── no 12px, la escala respira */
  --spacing-4: 1.25rem;   /* 20px  ─── no 16px, más generoso */
  --spacing-5: 1.75rem;   /* 28px  */
  --spacing-6: 2.5rem;    /* 40px  */
  --spacing-7: 3.5rem;    /* 56px  */
  --spacing-8: 5rem;      /* 80px  */
}
```

> La escala es deliberadamente no-aritmética. Como intervalos musicales, no grid militar. Esto crea ritmo visual orgánico.

### 4.2 Reglas de Aplicación

| Contexto | Token | Valor | Tailwind |
|----------|-------|-------|----------|
| Gap entre items de lista | `--spacing-3` | 14px | `gap-3` |
| Padding de tarjeta | `--spacing-4` | 20px | `p-4` |
| Padding de tarjeta en KDS | `--spacing-6` | 40px | `p-6` |
| Separación de secciones | `--spacing-5` | 28px | `mb-5` |
| Padding de página | `--spacing-4` | 20px | `p-4` |
| Padding de modal | `--spacing-5` | 28px | `p-5` |
| Gap de grid de productos | `--spacing-3` | 14px | `gap-3` |
| Container max-width | — | 960px | `max-w-[960px]` |
| Container KDS | — | 100% | `w-full` |

### 4.3 Touch Targets

| Dispositivo | Objetivo mínimo | Tailwind |
|-------------|-----------------|----------|
| Mesero (tablet 10") | 48x48px | `min-h-[48px] min-w-[48px]` |
| Cajero/Admin (desktop) | 36x36px | `min-h-[36px] min-w-[36px]` |
| KDS (32" monitor) | 72x72px | `min-h-[72px] min-w-[72px]` |

---

## 5. Bordes y Radios — Variable ("Como Costuras")

| Elemento | Radios | Border | Nota |
|----------|--------|--------|------|
| Botones (primary/secondary) | `--radius-control` (4px) | none | Contraste intencional con tarjetas suaves |
| Botones chip/tag | `--radius-chip` (full) | none | Pastillas amigables |
| Inputs, selects, textareas | `--radius-control` (4px) | 1px `text-muted` | Focus border cambia a `primary` |
| Tarjetas (cards) | `--radius-card` (16px) | none | Sombras suaves dan profundidad |
| Modales, drawers, sheets | `--radius-modal` (24px) | none | |
| Avatares, badges de rol | `--radius-chip` (full) | none | Circulares |
| KDS tarjetas | `--radius-kds-card` (12px) | 1px `kds-surface` | Sutil en tema oscuro |
| Imágenes de producto | `--radius-card` (16px) | none | |

> **Principio:** La variación en radios es intencional y refleja la materialidad de "tela cosida" — diferentes partes del "vestido" tienen diferentes curvas.

---

## 6. Sombras y Profundidad — "Luz de Ventana"

| Nivel | Sombras | Uso |
|-------|---------|-----|
| Flat | `none` | Background, texto, separadores |
| Elevated 1 | `0 2px 8px oklch(0.20 0.03 45 / 0.10)` | Tarjetas (default) |
| Elevated 2 | `0 4px 16px oklch(0.20 0.03 45 / 0.15)` | Tarjetas (hover), dropdowns |
| Elevated 3 | `0 16px 48px oklch(0.20 0.03 45 / 0.22)` | Modales, sheets |
| Elevated 4 | `0 4px 12px oklch(0.20 0.03 45 / 0.14)` | Toasts, notificaciones |
| KDS Card | `0 4px 16px oklch(0 0 0 / 0.40)` | Tarjetas en KDS |

> **Principio:** Las sombras usan el color de texto primario (espresso) en vez de negro puro. Esto da calidez incluso a la profundidad.

---

## 7. Motion & Animation

### 7.1 Principios

- **Personalidad "Café de Madrid":** Animaciones con ritmo y rebote, no mecánicas.
- **Duración por defecto:** 150-200ms para micro-interacciones, 300-400ms para transiciones de página.
- **Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` para rebote suave en interacciones. `cubic-bezier(0.4, 0, 0.2, 1)` para entradas/salidas direccionales.
- **`prefers-reduced-motion`:** Respetar siempre. Desactivar animaciones, usar opacidad directa.

### 7.2 Catálogo de Animaciones

| Tipo | Especificación | Duración | Técnica |
|------|----------------|----------|---------|
| **Page transition** | Slide horizontal (dirección del flujo) con fade | 300ms | CSS `transform` + `opacity` |
| **Card enter** | Scale 0.95→1 + fade in, staggered (50ms entre cards) | 200ms | CSS `@keyframes` |
| **Button hover** | Scale 1.02 + shadow grow | 150ms | Tailwind `hover:scale-[1.02] transition-transform` |
| **Button press** | Scale 0.97 | 100ms | `active:scale-[0.97]` |
| **Modal open** | Scale 0.92→1 + fade, con overshoot suave | 300ms | CSS animation |
| **Toast enter** | Slide from top-right + fade | 250ms | CSS animation |
| **Toast exit** | Slide to right + fade | 200ms | CSS animation |
| **KDS new order** | Slide from top + scale bounce + terracotta glow pulse (300ms) luego settle | 500ms total | CSS + Tailwind |
| **KDS order done** | Slide out right + fade + scale-down | 400ms | CSS animation |
| **KDS aging pulse** | `animate-pulse` en warning/critical (>10 min) | 2s loop | Tailwind `animate-pulse` |
| **Skeleton loading** | "Shimmer textil" — gradiente diagonal sutil con patrón de tela | 1.5s loop | CSS `background-image` con gradiente animado |
| **Empty state icon** | Fade in + float suave (translateY -4px loop) | 3s loop | CSS animation |
| **Drag to reorder** | Translate sigue cursor + snap back si se suelta | real-time | DnD library (dnd-kit) |

### 7.3 Rotaciones — "Diario Personal"

Las tarjetas y elementos pueden tener rotaciones sutiles (1-2°) para evocar la estructura de "collage pegado a mano":

```css
/* Aplicar aleatoriamente vía nth-child en grids */
.card-rotate-1 { transform: rotate(0.5deg); }
.card-rotate-2 { transform: rotate(-0.8deg); }
.card-rotate-3 { transform: rotate(1.2deg); }
.card-rotate-4 { transform: rotate(-0.3deg); }
```

> **Regla:** Solo aplicar rotaciones en grids de tarjetas (mesas, órdenes). NO en inputs, modales, tablas de datos, o KDS. Las rotaciones son decorativas, no funcionales.

---

## 8. Texturas y Detalles Orgánicos

### 8.1 Fondo de "Tela"

```css
/* Textura sutil tipo lienzo — aplicar a .bg-texture o body */
.bg-texture {
  background-image:
    radial-gradient(ellipse at 20% 50%, oklch(0.72 0.16 75 / 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, oklch(0.55 0.15 38 / 0.02) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q35 30 30 55' stroke='%233d2b1f' stroke-width='0.3' fill='none' opacity='0.03'/%3E%3C/svg%3E");
}
```

> Solo aplicar al fondo de las pantallas de mesero y admin. No en KDS (distrae). No en modales (rompe jerarquía). La textura debe ser casi invisible — detectable pero no nombrable.

### 8.2 Bordes de "Hilo"

Para separadores o bordes decorativos, usar gradientes lineales que simulan hilo:

```css
.border-stitch {
  border-image: repeating-linear-gradient(
    90deg,
    oklch(0.55 0.15 38 / 0.15) 0px,
    oklch(0.55 0.15 38 / 0.15) 3px,
    transparent 3px,
    transparent 8px
  ) 1;
}
```

> Uso: Bordes inferiores de headers, separadores de sección, bordes de tarjetas destacadas. No abusar.

---

## 9. Componentes Base

### 9.1 Botones

```css
/* Primary — Terracotta bold */
.btn-primary {
  @apply bg-primary text-primary-foreground font-bold;
  @apply px-4 py-3 rounded-[var(--radius-control)];
  @apply shadow-[var(--shadow-card)];
  @apply transition-all duration-150 ease-out;
  @apply hover:bg-primary-light hover:scale-[1.02] hover:shadow-[var(--shadow-card-hover)];
  @apply active:bg-primary-dark active:scale-[0.97];
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100;
  /* loading state handled by component */
  font-family: 'Space Grotesk', system-ui, sans-serif;
  letter-spacing: 0.01em;
}
```

```css
/* Secondary — Moss outline */
.btn-secondary {
  @apply bg-transparent text-secondary border border-secondary font-semibold;
  @apply px-4 py-3 rounded-[var(--radius-control)];
  @apply transition-all duration-150 ease-out;
  @apply hover:bg-secondary hover:text-secondary-foreground hover:scale-[1.02];
  @apply active:bg-secondary-dark active:scale-[0.97];
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
```

```css
/* Ghost — Para acciones secundarias minimalistas */
.btn-ghost {
  @apply bg-transparent text-text-secondary font-medium;
  @apply px-3 py-2 rounded-[var(--radius-control)];
  @apply transition-colors duration-150;
  @apply hover:bg-surface hover:text-text-primary;
  @apply active:scale-[0.97];
}
```

```css
/* Icon Button — Solo icono, con aria-label OBLIGATORIO */
.btn-icon {
  @apply inline-flex items-center justify-center;
  @apply text-text-secondary hover:text-text-primary;
  @apply rounded-[var(--radius-control)];
  @apply transition-all duration-150;
  @apply hover:bg-surface hover:scale-110;
  @apply active:scale-95;
}
```

### 9.2 Inputs

```css
.input-text {
  @apply w-full px-4 py-3;
  @apply bg-surface border border-text-muted/30 rounded-[var(--radius-control)];
  @apply text-text-primary placeholder:text-text-muted;
  @apply transition-all duration-150;
  @apply focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.input-error {
  @apply border-error focus:ring-error/20;
}
```

### 9.3 Tags / Chips / Badges

```css
.badge {
  @apply inline-flex items-center gap-1.5;
  @apply px-3 py-1 rounded-[var(--radius-chip)];
  @apply text-sm font-medium;
  @apply transition-colors duration-150;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  letter-spacing: 0.01em;
}
```

**Status Badge colors (orden):**

| Status | bg | text | Icono (lucide) |
|--------|-----|------|-----------------|
| `draft` | `bg-text-muted/15` | `text-text-secondary` | `Pencil` |
| `in_kitchen` | `bg-warning/15` | `text-warning` | `CookingPot` |
| `ready` | `bg-info/15` | `text-info` | `CheckCircle` |
| `delivered` | `bg-purple-200` | `text-purple-800` | `Truck` |
| `paid` | `bg-success/15` | `text-success` | `Banknote` |
| `partially_paid` | `bg-orange-200` | `text-order-partially-paid` | `CreditCard` |
| `closed` | `bg-text-muted/15` | `text-text-secondary` | `Archive` |

**Role Badge colors:**

| Rol | bg | text |
|-----|-----|------|
| `waiter` | `bg-info/15` | `text-info` |
| `cashier` | `bg-success/15` | `text-success` |
| `admin` | `bg-primary/15` | `text-primary` |
| `superadmin` | `bg-error/15` | `text-error` |

### 9.4 Cards (Tarjeta "Tela")

```css
.card {
  @apply bg-surface rounded-[var(--radius-card)];
  @apply shadow-[var(--shadow-card)];
  @apply transition-all duration-200 ease-out;
  @apply hover:shadow-[var(--shadow-card-hover)];
}

/* Rotación sutil en grids (aplicar vía nth-child) */
.card:nth-child(odd)  { transform: rotate(0.6deg); }
.card:nth-child(even) { transform: rotate(-0.4deg); }
```

### 9.5 Modal

```css
.modal-overlay {
  @apply fixed inset-0 bg-text-primary/30 backdrop-blur-sm;
  @apply flex items-center justify-center;
  @apply z-50;
}

.modal-content {
  @apply bg-surface rounded-[var(--radius-modal)] shadow-[var(--shadow-modal)];
  @apply w-full max-w-lg p-5;
  @apply animate-[modal-in_300ms_cubic-bezier(0.34,1.56,0.64,1)];
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.92) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
```

---

## 10. Estados Especiales — Anti-Slop Zone

### 10.1 Empty States

> Cada empty state usa microcopy con la voz de "El Artista". Metáforas, calidez, humanidad. NUNCA "No data found".

**Mesas (mesero):**
> *"Aún no hay mesas activas. Cuando asignes tu primera mesa del turno, aparecerá aquí como un lienzo en blanco listo para ser pintado."*
> → Icono: `Palette` (lucide), animación float suave. Botón opcional: "Asignar mesa".

**Órdenes (mesero):**
> *"El silencio antes del primer plato. Toca '+' para crear una nueva orden y darle sabor a la cocina."*
> → Icono: `UtensilsCrossed`, animación float. Botón: "Nueva orden".

**Órdenes (cajero):**
> *"Todo en calma. Cuando llegue una cuenta por cobrar, la verás aquí — lista para cerrar el círculo."*
> → Icono: `Coffee`, animación float.

**Búsqueda sin resultados:**
> *"Nada coincide con tu búsqueda. ¿Quizás lo anotaron con otro nombre? Prueba con menos letras."*
> → Icono: `SearchX`.

### 10.2 Error States

> NUNCA "Something went wrong". Cada error cuenta una historia mínima.

**Error de conexión:**
> *"Parece que perdimos la señal. La cocina sigue trabajando — tus órdenes en borrador están a salvo. ¿Reintentamos?"*
> → Icono: `WifiOff`. Botón: "Reintentar".

**Error de servidor (500):**
> *"Algo se enredó en el hilo. No es tu culpa — nuestro equipo ya lo está desenredando."*
> → Icono: `Frown`. Botón: "Volver al inicio".

**Error de validación:**
> *"{Campo} necesita un poco de amor. {Mensaje específico}."*
> → Sin icono. Mensaje inline con border-error en el input.

**Error de autorización (403):**
> *"Esta sección es solo para {rol}. Si crees que deberías verla, pídele a tu administrador que ajuste los hilos."*
> → Icono: `Lock`.

### 10.3 Loading States

> NUNCA spinners genéricos. Usar "shimmer textil" (gradiente diagonal que evoca hilo).

```css
/* Shimmer textil — alterna entre dorado cálido y terracota sutil */
.skeleton {
  @apply bg-surface rounded-[var(--radius-card)] overflow-hidden;
  background: linear-gradient(
    110deg,
    oklch(0.95 0.02 75) 30%,     /* linen */
    oklch(0.72 0.16 75 / 0.15) 50%,  /* golden shimmer */
    oklch(0.95 0.02 75) 70%      /* linen */
  );
  background-size: 200% 100%;
  animation: shimmer-textil 1.5s ease-in-out infinite;
}

@keyframes shimmer-textil {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Variantes:**
- `skeleton-card` → dimensiones de OrderCard (ancho del contenedor, alto 140px)
- `skeleton-table-row` → dimensiones de fila de tabla (ancho completo, alto 56px)
- `skeleton-kds` → dimensiones de KDSOrderCard (grid cell, alto 280px)
- `skeleton-button` → dimensiones de botón (ancho 120px, alto 44px)

### 10.4 Success States

**Orden enviada a cocina:**
> *"¡A cocinar! Tu orden #{id} ya está en manos del chef. La magia comienza."*
> → Toast con icono `ChefHat`, animación slide-in desde top-right, auto-dismiss 3s.

**Pago completado:**
> *"Cuenta saldada. Mesa {número} lista para su próxima historia."*
> → Toast verde musgo, icono `CheckCircle`.

**Onboarding completado:**
> *"Ya estás listo. El restaurante es tu escenario — a brillar."*
> → Full-screen success con animación, redirige a home en 2s.

### 10.5 Dropdowns, Popovers, Tooltips

```css
.dropdown-content {
  @apply bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-card-hover)];
  @apply border border-text-muted/10;
  @apply py-1 min-w-[180px];
  @apply animate-[dropdown-in_150ms_ease-out];
}

@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.dropdown-item {
  @apply px-4 py-2 mx-1 rounded-[var(--radius-control)];
  @apply text-text-primary text-sm cursor-pointer;
  @apply transition-colors duration-100;
  @apply hover:bg-primary/10;
}
```

---

## 11. Layout Patterns

### 11.1 Mesero (Tablet 10", Touch)

```
┌──────────────────────────────┐
│  Header: Title + User avatar  │  h-14
├──────────────────────────────┤
│                              │
│  Main Content                │  flex-1, max-w-[960px] mx-auto
│  (padding p-4)               │  gap-3 grid-cols-2 (productos)
│  (productos: grid de tarjetas
│   con rotación sutil)        │
│                              │
├──────────────────────────────┤
│  Bottom Nav: 3-4 items       │  h-16, icon + label
│  (Mesas | Órdenes | Perfil)  │  btn-ghost activo → primary
└──────────────────────────────┘
```

- No hover effects (touch no tiene hover). Usar `active:` states.
- Touch targets min 48x48px.
- Swipe gestures para navegación entre tabs.
- Fondo con textura de tela sutil.

### 11.2 Cajero / Admin (Desktop)

```
┌──────────┬──────────────────────────────────┐
│ Sidebar  │  Header: Page title + SearchBar   │
│ w-64     ├──────────────────────────────────┤
│          │                                  │
│ Nav      │  Main Content                    │
│ links    │  flex-1, max-w-[960px] mx-auto   │
│ + logo   │  Tablas con striped (alternan)    │
│          │  bg-surface / bg-background       │
│          │  Hover en filas: bg-primary/5     │
│          │                                  │
│          │  Split-panel view (cajero):       │
│          │  lista izq + detalle der          │
│          │                                  │
│ User     │  Footer: status bar              │
│ menu     │                                  │
└──────────┴──────────────────────────────────┘
```

- Sidebar con logo arriba, nav links con `Space Grotesk`, item activo → `bg-primary/10 text-primary`.
- Sidebar fondo `surface`, separado del contenido con borde "hilo" (border-stitch).
- Hover states en filas de tabla y botones.
- Focus visible para keyboard nav.

### 11.3 KDS (32" 1080p Monitor, Pared)

```
┌────────────────────────────────────────────────────┐
│  KDS Header: Restaurante + Hora + Órdenes activas   │  h-20
│  bg-kds-bg, text-kds-text                           │
├────────────────────────────────────────────────────┤
│                                                     │
│  Grid de órdenes: grid-cols-4 gap-6 p-6             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Mesa 3  │ │ Mesa 7  │ │ Mesa 1  │ │ Mesa 12 │   │
│  │ 2 items │ │ 4 items │ │ 1 item  │ │ 5 items │   │
│  │ 2:34 ⏱  │ │ 0:15 ⏱  │ │ 8:45 ⚠  │ │ 14:02 🚨│   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                     │
│  New orders: slide-in from top + amber glow         │
│  Done orders: slide-out right + fade                │
│                                                     │
└────────────────────────────────────────────────────┘
```

**Reglas KDS:**
- Dark theme: `bg-kds-bg`, `text-kds-text`, `border-kds-surface`.
- Tipografía: `Space Grotesk Bold` en TODO (headings y body). No system-ui.
- `cursor: none` en pantalla completa.
- `data-kds` attribute en el root para scoping de estilos oscuros.
- Auto `fullscreen()` + `wakeLock` on mount.
- Grid `grid-cols-4`, tarjetas con `rounded-[var(--radius-kds-card)]`.
- No textura de fondo. No rotaciones. Esto es funcional, no decorativo.

**KDS Order Aging (Dark Theme):**

| Tiempo | Indicador | Estilo |
|--------|-----------|--------|
| `<5 min` | Normal | `border-kds-surface` |
| `5-10 min` | Atención | `border-accent animate-pulse` |
| `10-15 min` | Warning | `border-warning animate-pulse` + icono `AlertTriangle` |
| `>15 min` | Crítico | `border-error animate-pulse` + icono `AlertTriangle` + fondo `error/15` |

### 11.4 Breakpoints

| Nombre | Min-width | Dispositivo |
|--------|-----------|-------------|
| `sm` | 640px | Tablet portrait |
| `md` | 768px | Tablet landscape |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop wide |
| `kds` | 1920px | KDS monitor |

### 11.5 Login Screen

```
┌─────────────────────────────────────┐
│                                     │
│           [Logo SOR]                │
│      "Bienvenido de vuelta"         │
│                                     │
│    ┌─────────────────────────┐      │
│    │  Email                   │      │
│    ├─────────────────────────┤      │
│    │  Contraseña              │      │
│    ├─────────────────────────┤      │
│    │  [  Entrar al restaurante ]│    │
│    └─────────────────────────┘      │
│                                     │
│   Textura de fondo: tela sutil      │
│   Card centrada, sombra modal       │
│   "Entrar al restaurante" no "Login"│
└─────────────────────────────────────┘
```

---

## 12. Assets Visuales

### 12.1 Iconos

- **Librería:** `lucide-react` (árbol sacudido, import individual).
- **Estilo:** Linear, stroke-width 2.

| Contexto | Tamaño | Tailwind |
|----------|--------|----------|
| Mesero (tablet, touch) | 24px | `size-6` |
| Cajero/Admin (desktop) | 16px | `size-4` |
| KDS | 32px | `size-8` |
| Icono en botón | igual que texto (~20px) | `size-5` |
| Icono decorative (empty state) | 48px | `size-12` |

> **Reglas:** Icon-only buttons requieren `aria-label` SIEMPRE. No usar iconos sin texto en navegación principal (bottom nav, sidebar).

### 12.2 Ilustraciones

- **Empty states:** SVG inline minimalistas, trazo irregular (como boceto a mano). Colores: `text-muted` con opacidad variable.
- **Error states:** Mismo estilo, tono `error` suave.
- **Sin fotografías de stock.** Si se necesita imagen de producto, placeholder con textura.

### 12.3 Tratamiento de Imágenes

- Productos: `rounded-[var(--radius-card)]`, con ligero `shadow-[var(--shadow-card)]`.
- Avatares: Circulares (`rounded-full`), border 2px `primary/20`.
- Sin filtros. Sin overlays de color sobre imágenes.

---

## 13. Prohibiciones Explícitas — Anti-Slop Manifesto

Esta app NUNCA usará:

- [ ] Gradiente púrpura/azul genérico de AI
- [ ] Spinner de carga genérico (usar skeleton textil)
- [ ] "No data found" como empty state
- [ ] "Something went wrong" como error state
- [ ] Paleta de grises fríos sin punto de vista emocional
- [ ] Radios uniformes de 8px en todos los elementos
- [ ] Layout simétrico de 12-columnas en todos lados
- [ ] Animaciones fade-in genéricas sin dirección ni propósito
- [ ] Iconos de Material Design sin personalización (usamos lucide)
- [ ] Hero centrado con un CTA y tres features cards debajo
- [ ] Cards sin rotación en grids de mesero
- [ ] Tipografía sin bold en headings (Space Grotesk Bold es OBLIGATORIO en títulos)
- [ ] Negro puro `#000` o `oklch(0 0 0)` en ninguna parte (usar espresso `#2c1a10`)
- [ ] Blanco puro `#fff` como fondo (usar parchment `#fdfaf5`)
- [ ] Scrollbars default del browser (estilizar con warm tones)

---

## 14. Referencias Visuales

Sitios y apps que capturan la esencia de este design system:

1. **[Goodfight](https://goodfight.com)** — Tipografía bold + texturas orgánicas, layout editorial con rotaciones
2. **[Are.na](https://are.na)** — Estructura tipo "collage pegado a mano", bordes variables, personalidad de cuaderno
3. **[Everlane](https://everlane.com)** — Paleta terrosa, calidez, textil como inspiración material
4. **[Klim Type Foundry](https://klim.co.nz)** — Bold typography as hero, imperfect grid
5. **[Restaurant Noma](https://noma.dk)** — Fotografía y color: terracotas, musgos, cremas, otoño nórdico

---

## 15. Implementación: shadcn/ui Theme

```jsonc
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks",
    "utils": "@/lib/utils"
  }
}
```

> **Nota:** shadcn/ui se usa SOLO para primitivas (Button, Dialog, Sheet, Select, etc.). Todos los tokens visuales son nuestros (definidos en este documento). Los componentes shadcn se sobreescriben vía CSS variables de Tailwind `@theme`, nunca modificando el source de shadcn directamente.

### Tailwind Config (app.css)

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

@theme {
  /* === Colores (ver sección 2.1 para lista completa) === */
  /* Hereda todos los --color-* definidos arriba */

  /* === Radios variables === */
  --radius: 1rem; /* default → card */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1.5rem;
  --radius-xl: 9999px;

  /* === Sombras === */
  /* Hereda --shadow-* */

  /* === Fuentes === */
  --font-sans: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

/* === Scrollbar con personalidad === */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: oklch(0.95 0.02 75); /* linen */
}
::-webkit-scrollbar-thumb {
  background: oklch(0.60 0.03 58); /* muted-brown */
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: oklch(0.45 0.03 55); /* text-secondary */
}

/* === prefers-reduced-motion === */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* === KDS dark theme scope === */
[data-kds] {
  color-scheme: dark;
}
[data-kds] ::-webkit-scrollbar-track {
  background: oklch(0.15 0.02 38);
}
[data-kds] ::-webkit-scrollbar-thumb {
  background: oklch(0.45 0.02 55);
}
```

---

## 16. Utilidades

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/** Aplica rotación pseudo-aleatoria basada en índice para efecto "diario personal" */
export function cardRotation(index: number): string {
  const rotations = [0.6, -0.4, 0.3, -0.7, 0.9, -0.5, 0.2, -0.8];
  return `rotate(${rotations[index % rotations.length]}deg)`;
}
```

---

> **Este documento es la fuente de verdad visual del proyecto SOR. Todo PR de UI debe justificarse contra estas reglas.**
