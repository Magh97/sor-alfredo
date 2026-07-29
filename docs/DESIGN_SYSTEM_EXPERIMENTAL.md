# Design System Experimental: SOR
## Versión: Experimental v1 | 2026-07-29

---

## 1. Manifiesto de Diseño

> Esta app existe para gestionar un restaurante. No es genérica porque es cruda, victoriana, impresa en papel y brutalista. Si alguien puede decir "esto parece hecho por AI", hemos fallado.

- **Movimiento artístico:** Brutalismo Web 3.0 — raw, sin adornos, tipografía masiva, bordes duros
- **Navegación:** Scroll como viaje — contenido revelado en capas, sin páginas
- **Tipografía como:** Collage tipográfico — 4 fuentes mezcladas con intención
- **Materialidad:** Papel vívido — arrugado, rasgado, superpuesto
- **Interacción como:** Transformación morphing — elementos que se convierten en otros
- **Estructura:** Línea de tiempo viviente — pasado, presente, futuro fluyendo horizontalmente

---

## 2. Paleta de Color — Victorian Autumn Café

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#6B1A2A` | Burgundy — Botones, CTAs, bordes principales |
| `--color-primary-light` | `#8B2535` | Hover states |
| `--color-primary-dark` | `#4A0F1B` | Active/pressed |
| `--color-primary-foreground` | `#F0E6D3` | Texto sobre burgundy |
| `--color-secondary` | `#2D4A22` | Forest green — Precios, confirmaciones |
| `--color-secondary-light` | `#3D6230` | Hover secondary |
| `--color-secondary-dark` | `#1C3015` | Active secondary |
| `--color-background` | `#F0E6D3` | Parchment — Fondo general |
| `--color-surface` | `#EBDCC4` | Paper surface — Tarjetas, paneles |
| `--color-surface-elevated` | `#E5D4B8` | Paper elevated |
| `--color-text-primary` | `#2C1810` | Dark espresso |
| `--color-text-secondary` | `#5C4030` | Warm brown |
| `--color-text-muted` | `#8B7355` | Muted |
| `--color-accent` | `#C9A84C` | Antique gold — Badges, highlights |
| `--color-accent-foreground` | `#2C1810` | Texto sobre gold |
| `--color-success` | `#2D4A22` | Forest green |
| `--color-error` | `#8B1A1A` | Deep red |
| `--color-warning` | `#C9A84C` | Antique gold |
| `--color-info` | `#3A5068` | Deep navy |
| `--color-kds-bg` | `#1A1410` | Carbon paper |
| `--color-kds-surface` | `#2A1F18` | Dark paper |
| `--color-kds-text` | `#F0E6D3` | Parchment on dark |

---

## 3. Tipografía como Collage

### 3.1 Fuentes (4-font system)

| Rol | Fuente | Peso | Uso |
|-----|--------|------|-----|
| **Serif Display** | `'Playfair Display', 'Georgia', serif` | 700-900 | Nombres de platillos, títulos de sección |
| **Mono Grotesk** | `'JetBrains Mono', 'Courier New', monospace` | 400-700 | Precios, IDs de orden, datos numéricos |
| **Sans Bold** | `'DM Sans', 'Helvetica Neue', sans-serif` | 700 | Headers de página, labels, botones |
| **Script/Accent** | `'Caveat', cursive` | 400 | Modificadores, notas, empty states |

### 3.2 Escala (brutalist, no-aritmética)

| Token | Tamaño | Uso | Fuente |
|-------|--------|-----|--------|
| `hero` | 15vw (mobile), 8vw (desktop) | Título de sección | Serif Display 900 |
| `h1` | 48px | Page titles | Sans Bold 700 |
| `h2` | 36px | Card titles | Serif Display 700 |
| `h3` | 28px | Section headers | Sans Bold 700 |
| `body` | 18px | Body text | Sans 400 / Serif 400 mezclado |
| `price` | 24px | Precios | Mono Grotesk 700 |
| `label` | 14px | Labels, metadata | Sans Bold 700 |
| `caption` | 12px | Timestamps | Mono Grotesk 400 |
| `modifier` | 16px | Modificadores, notas | Script 400 |
| `order-id` | 32px | Números de orden | Mono Grotesk 700 |

### 3.3 Collage Rules

```
- Títulos de platillo: Serif Display 700, 36px, tracking: -0.01em
- Precios: Mono Grotesk 700, 24px, tracking: +0.02em, color forest-green
- IDs de orden: Mono Grotesk 700, 32px, tracking: +0.05em
- Modificadores: Script 400, 16px, indentado bajo el platillo
- Headers: Sans Bold 700, 48px, tracking: -0.02em, uppercase
- Labels y badges: Sans Bold 700, 14px, uppercase, tracking: +0.1em
```

---

## 4. Bordes y Radios — Hard + Irregular

| Elemento | Border | Radius | Notas |
|----------|--------|--------|-------|
| Botones | 4px solid primary | 0px | Sin redondeo |
| Tarjetas | 4px solid primary-dark | 0px | Clip-path irregular en esquina superior-izquierda |
| Inputs | 2px solid text-muted | 0px | Focus: 4px solid primary |
| Modales | 6px solid primary | 0px | Sin sombra, solo borde duro |
| Chips/Badges | 2px solid accent | 0px | Rectangulares |
| KDS tickets | 0px | 0px | Look de ticket impreso, borde punteado |

### Clip-path irregular para tarjetas:

```css
.card-brutal {
  clip-path: polygon(
    8px 0%, 100% 0%, 100% calc(100% - 8px),
    calc(100% - 8px) 100%, 0% 100%, 0% 8px
  );
}
```

---

## 5. Materialidad — Paper Vivid Textures

### Fondo de papel

```css
.bg-paper {
  background-color: #F0E6D3;
  background-image:
    url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.04' /%3E%3C/svg%3E");
}
```

### Sombra de papel sobre papel

```css
.shadow-paper {
  box-shadow:
    0 1px 0 #C9A84C,
    0 2px 0 #A08030,
    0 3px 4px rgba(44,24,16,0.15);
}
```

### Borde rasgado (top/bottom de secciones)

```css
.border-torn {
  border-top: 3px solid #6B1A2A;
  position: relative;
}
.border-torn::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 0;
  width: 100%;
  height: 6px;
  background: repeating-linear-gradient(
    90deg,
    transparent, transparent 8px,
    #F0E6D3 8px, #F0E6D3 12px,
    transparent 12px, transparent 20px,
    #F0E6D3 20px, #F0E6D3 22px,
    transparent 22px, transparent 30px
  );
}
```

---

## 6. Scroll + Timeline Layout

### Navegación principal: Scroll como viaje vertical

```
┌────────────────────────────────┐
│ SECTION 1: Mesas (actual)      │ ← scroll vertical
│ ┌──┐ ┌──┐ ┌──┐                │   anclado al viewport
│ └──┘ └──┘ └──┘                │
├────────────────────────────────┤ ← borde rasgado
│ SECTION 2: Órdenes activas     │
│ [← timeline horizontal →]      │ ← scroll horizontal
│ #42  #43  #44  #45             │   dentro de la sección
├────────────────────────────────┤
│ SECTION 3: Historial           │
│ ...                            │
└────────────────────────────────┘
```

### Timeline horizontal de órdenes

```css
.timeline {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 0;
}
.timeline-card {
  scroll-snap-align: start;
  min-width: 320px;
  border-left: 4px solid #6B1A2A;
  padding: 24px;
}
```

---

## 7. Estados Especiales — Paper Story

```
LOADING: "Preparando el papel..." — Texto que se escribe solo (typewriter effect)
          en Mono Grotesk sobre fondo pergamino. Sin spinner.

EMPTY: "Esta hoja está en blanco. El primer trazo es el más importante."
       — Script font, centrado en la tarjeta de papel.

ERROR: "El tintero se ha volcado." — Texto en serif 24px, color error.
       Fondo con mancha de tinta SVG sutil.

SUCCESS: "✓ Sellado." — Mono Grotesk bold 18px, color forest-green.
         Efecto de sello de lacre (círculo rojo con borde irregular).
```

---

## 8. Anti-Slop Manifesto Experimental

Esta app NUNCA usará:
- [ ] Gradiente púrpura/azul genérico de AI
- [ ] Spinner circular genérico
- [ ] "No data found" / "Something went wrong"
- [ ] Esquinas redondeadas (solo 0px o clip-path irregular)
- [ ] Sombras al 0.1 de opacidad
- [ ] Paleta de grises sin personalidad
- [ ] Grid de 12 columnas simétrico
- [ ] Inter o Roboto como fuente
- [ ] Fade-in genéricos sin dirección
- [ ] Emojis de cualquier tipo
- [ ] Iconos sin personalizar
- [ ] Layout responsive que solo encoge
- [ ] Animaciones que solo cambian color u opacidad
- [ ] Bordes uniformes en todos los elementos
- [ ] Tipografía sin intención (una sola fuente para todo)
