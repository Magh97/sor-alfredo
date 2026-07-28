# Design System -- SOR

> Stack: React 19 + Vite + Tailwind CSS 4.3 + shadcn/ui + lucide-react
> Brand: Warm/restaurant (amber primary, green accent)
> KDS: Dark theme, 24px+ typography, legible a 2m

---

## 1. Design Tokens

### 1.1 Colors

```css
/* tailwind.config.ts / app.css @theme */
@theme {
  /* Brand */
  --color-primary: oklch(0.705 0.2 62);           /* amber-600  #d97706 */
  --color-primary-light: oklch(0.87 0.15 75);      /* amber-400  #fbbf24 */
  --color-primary-dark: oklch(0.55 0.18 55);        /* amber-800  #92400e */
  --color-primary-foreground: oklch(0.99 0 0);      /* white      #ffffff */

  /* Accent */
  --color-accent: oklch(0.65 0.2 142);              /* green-600  #16a34a */
  --color-accent-foreground: oklch(0.99 0 0);

  /* Neutral */
  --color-neutral-50: oklch(0.985 0 0);
  --color-neutral-100: oklch(0.97 0 0);
  --color-neutral-200: oklch(0.92 0 0);
  --color-neutral-300: oklch(0.87 0 0);
  --color-neutral-400: oklch(0.71 0 0);
  --color-neutral-500: oklch(0.55 0 0);
  --color-neutral-600: oklch(0.44 0 0);
  --color-neutral-700: oklch(0.37 0 0);
  --color-neutral-800: oklch(0.27 0 0);
  --color-neutral-900: oklch(0.21 0 0);
  --color-neutral-950: oklch(0.13 0 0);

  /* Semantic */
  --color-success: oklch(0.65 0.2 142);             /* green-500  */
  --color-error: oklch(0.55 0.25 25);               /* red-600    */
  --color-warning: oklch(0.75 0.18 75);             /* amber-500  */
  --color-info: oklch(0.55 0.22 255);               /* blue-500   */

  /* Order Status */
  --color-order-draft: oklch(0.71 0 0);             /* gray-400   */
  --color-order-in-kitchen: oklch(0.75 0.18 75);    /* amber-500  */
  --color-order-ready: oklch(0.55 0.22 255);        /* blue-500   */
  --color-order-delivered: oklch(0.5 0.2 290);      /* purple-500 */
  --color-order-paid: oklch(0.65 0.2 142);          /* green-500  */
  --color-order-partially-paid: oklch(0.68 0.2 45); /* orange-500 */
  --color-order-closed: oklch(0.55 0 0);            /* gray-500   */

  /* Table Status */
  --color-table-free: oklch(0.65 0.2 142);          /* green-500  */
  --color-table-occupied: oklch(0.55 0.25 25);      /* red-600    */
  --color-table-reserved: oklch(0.75 0.18 75);      /* amber-500  */
  --color-table-cleaning: oklch(0.55 0.22 255);     /* blue-500   */

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Shadows */
  --shadow-card: 0 1px 3px oklch(0 0 0 / 0.1);
  --shadow-modal: 0 20px 60px oklch(0 0 0 / 0.3);
  --shadow-kds-card: 0 4px 12px oklch(0 0 0 / 0.5);
}
```

### 1.2 Typography

**Regular scale** (mesero, cajero, admin):

| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| `text-xs` | 12px | 1rem | Captions, timestamps |
| `text-sm` | 14px | 1.25rem | Secondary text, labels |
| `text-base` | 16px | 1.5rem | Body, inputs, table cells |
| `text-lg` | 18px | 1.75rem | Card titles, section headers |
| `text-xl` | 20px | 1.75rem | Page titles |
| `text-2xl` | 24px | 2rem | Screen headers |
| `text-3xl` | 30px | 2.25rem | Dashboard stats |
| `text-4xl` | 36px | 2.5rem | Hero numbers |

**KDS scale** (min 24px, legible at 2m):

| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| `text-kds-sm` | 24px | 1.2 | Table number, timer |
| `text-kds-base` | 32px | 1.3 | Item names, quantities |
| `text-kds-lg` | 48px | 1.2 | Order number, mesa number |
| `text-kds-xl` | 64px | 1.1 | Headers, elapsed time |
| `text-kds-2xl` | 80px | 1 | Critical alerts, timer >15min |

Font family: `system-ui, -apple-system, sans-serif`. No custom fonts to avoid loading latency in restaurant network.

### 1.3 Spacing

Standard Tailwind scale. Additional rules:

| Context | Minimum Target | Recommended Padding |
|---------|---------------|-------------------|
| Touch (mesero tablet) | 48x48px | `p-3` or `p-4` |
| Click (cajero/admin desktop) | 32x32px | `p-2` or `p-3` |
| KDS cards | -- | `p-6` or `p-8` |

### 1.4 Icons

Library: **lucide-react**. Always import individually for tree-shaking.

Sizing per profile:

| Profile | Default Size | Large | Use |
|---------|-------------|-------|-----|
| Mesero | `size-6` (24px) | `size-8` (32px) | Touch targets need visible icons |
| Cajero/Admin | `size-4` (16px) | `size-5` (20px) | Inline with text in tables |
| KDS | `size-8` (32px) | `size-12` (48px) | Visible at distance |

Convention: always provide `aria-label` when icon has no adjacent text.

```tsx
<Button aria-label="Enviar a cocina" size="lg">
  <Send className="size-6" />
</Button>
```

---

## 2. Screen Profiles

### 2.1 Breakpoints

```css
/* Tailwind defaults + custom for KDS */
@theme {
  --breakpoint-tablet: 640px;    /* sm */
  --breakpoint-desktop: 1024px;  /* lg */
  --breakpoint-kds: 1920px;      /* 1080p / Full HD */
}
```

### 2.2 Mesero (Tablet 10", Portrait, Touch)

```
┌──────────────────────────┐
│ ██████ Mesa 5 ██████████ │  ← Top bar: mesa actual + boton nueva mesa
├──────────────────────────┤
│                          │
│ ┌────────┐ ┌────────┐   │
│ │  Item  │ │  Item  │   │  ← Product grid: 2 cols, large touch cards
│ │ $120   │ │  $85   │   │
│ └────────┘ └────────┘   │
│ ┌────────┐ ┌────────┐   │
│ │  Item  │ │  Item  │   │
│ └────────┘ └────────┘   │
│                          │
├──────────────────────────┤
│ 🍔 Ordenes │ 🏠 Mesas │ 👤 │  ← Bottom nav: fixed, tall targets
└──────────────────────────┘
```

**Layout rules:**
- Max-width: `max-w-lg` on desktop breakpoint (don't stretch content on large screens)
- Bottom nav: always visible, `h-16`, fixed position
- Product cards: min-height 120px, tappable, no hover effects (touch only)
- `overscroll-behavior: contain` on scroll areas
- No text inputs if avoidable (prefer selects, toggles, number steppers)

### 2.3 Cajero (PC Desktop)

```
┌──────────┬──────────────────────────────────────┐
│          │  🔔 Cajero  │  Turno: 14:00-22:00     │
│  Logo    ├──────────────────────────────────────┤
│          │                                      │
│ 📋 Ordenes│  ┌──────────┬──────────────────────┐│
│          │  │ Search   │  Filters: Status ▾   ││
│ 💰 Caja  │  ├──────────┼──────────────────────┤│
│          │  │ Table    │ Detail / Payment     ││
│ 📊 Reporte│  │ (orders) │ Form                ││
│          │  │          │                      ││
│          │  │          │                      ││
│ ⚙️ Ajustes│  └──────────┴──────────────────────┘│
└──────────┴──────────────────────────────────────┘
```

**Layout rules:**
- Sidebar: `w-64`, fixed, icons + labels
- Content: flex-1, scrollable
- Tables: striped rows, hover state, clickable rows for detail
- Split view: order list (left 40%) + payment detail (right 60%)

### 2.4 Admin (PC Desktop)

Same sidebar layout as Cajero, with different nav items:

- Catalog (productos, categorias, modificadores)
- Users (gestion de personal)
- Configuracion (propinas, metodos de pago)
- Reportes (ventas, desempeno)

### 2.5 KDS (32" 1080p, Wall-Mounted, Dark Theme)

```
┌─────────────────────────────────────────────────────────┐
│  🕐 15:42  │  🔴 6 Activas  │  ✅ 23 Completadas Hoy    │
├────────────┬────────────┬────────────┬──────────────────┤
│  #42       │  #43       │  #44       │  #45             │
│  MESA 5    │  MESA 8    │  MESA 2    │  MESA 11         │
│  ⏱ 3 min  │  ⏱ 8 min  │  ⏱ 1 min  │  ⏱ 12 min 🔶    │
│            │            │            │                  │
│  2x Burger │  1x Pasta  │  3x Tacos  │  1x Parrillada   │
│  -sin ceb  │  +extra Q  │            │  2x Cerveza      │
│  1x Cola   │            │            │  -sin hielo      │
│            │            │            │                  │
│  [LISTA]   │  [LISTA]   │  [LISTA]   │  [LISTA]         │
├────────────┼────────────┼────────────┼──────────────────┤
│  #46       │  #47       │            │                  │
│  MESA 3    │  MESA 7    │            │                  │
│  ⏱ 18 min 🔴│  ⏱ 5 min  │            │                  │
│  4x Pizza  │  2x Ensal. │            │                  │
│  2x Agua   │            │            │                  │
│            │            │            │                  │
│  [LISTA]   │  [LISTA]   │            │                  │
└────────────┴────────────┴────────────┴──────────────────┘
```

**Layout rules:**
- CSS Grid: `grid-cols-4` for 4-column layout (fits 6-8 orders on 32" 1080p)
- Order cards fill grid cells, equal height (`min-height: 300px` on 1080p)
- FIFO ordering: oldest top-left → newest bottom-right
- New order: scale-in animation (300ms) + amber pulse
- Completed: slide-out + fade (500ms), then remove from grid
- Header: always visible, clock + counters
- Fullscreen: `requestFullscreen()` on mount
- Wake lock: prevent screen sleep

---

## 3. Color Semantics

### 3.1 Order Status

| Status | Color | Badge Class | Icon (lucide) |
|--------|-------|-------------|---------------|
| `draft` | gray-400 `🟢` | `bg-gray-100 text-gray-700` | `ClipboardList` |
| `in_kitchen` | amber-500 `🟡` | `bg-amber-100 text-amber-800` | `CookingPot` |
| `ready` | blue-500 `🔵` | `bg-blue-100 text-blue-800` | `CheckCircle` |
| `delivered` | purple-500 `🟣` | `bg-purple-100 text-purple-800` | `Truck` |
| `paid` | green-500 `🟢` | `bg-green-100 text-green-800` | `Banknote` |
| `partially_paid` | orange-500 `🟠` | `bg-orange-100 text-orange-800` | `CreditCard` |
| `closed` | gray-500 `⚫` | `bg-gray-100 text-gray-700` | `Archive` |

### 3.2 Table Status

| Status | Color | Map Pin |
|--------|-------|---------|
| `free` | green-500 | Green circle |
| `occupied` | red-600 | Red circle with order count |
| `reserved` | amber-500 | Amber circle with clock |
| `cleaning` | blue-500 | Blue circle with brush |

### 3.3 Payment Methods

| Method | Icon | Color |
|--------|------|-------|
| `cash` | `Banknote` | green-500 |
| `card` | `CreditCard` | blue-500 |
| `transfer` | `ArrowLeftRight` | purple-500 |

### 3.4 User Roles

| Role | Badge Color |
|------|------------|
| `waiter` | blue-100/blue-800 |
| `cashier` | green-100/green-800 |
| `admin` | amber-100/amber-800 |
| `superadmin` | red-100/red-800 |

### 3.5 KDS: Order Aging

Orders that stay in `in_kitchen` too long get visual warnings:

| Time | Visual | Class |
|------|--------|-------|
| < 5 min | Normal | `border-neutral-700` |
| 5-10 min | Amber border | `border-amber-500` |
| 10-15 min | Orange border + pulse | `border-orange-500 animate-pulse` |
| > 15 min | Red border + pulse + icon | `border-red-600 animate-pulse` + `AlertTriangle` icon |

Aging implementation:

```tsx
function useOrderAge(createdAt: string) {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const update = () => {
      setMinutes((Date.now() - new Date(createdAt).getTime()) / 60000);
    };
    update();
    const id = setInterval(update, 10000); // Update every 10s
    return () => clearInterval(id);
  }, [createdAt]);

  return minutes;
}

const kdsVariant = minutes > 15 ? 'critical'
  : minutes > 10 ? 'warning'
  : minutes > 5 ? 'attention'
  : 'normal';
```

---

## 4. Component Catalog

### 4.1 Primitives (shadcn/ui base)

These are the shadcn/ui components used throughout. Customize via Tailwind classes, never modify shadcn source directly. Override in `components/ui/`.

| Component | Customization | Use |
|-----------|--------------|-----|
| `Button` | Add `kds` variant + sizes | All interactions |
| `Input` | Larger padding for tablet | Forms |
| `Badge` | Order status variants | Status everywhere |
| `Card` | `Card.Header/Body/Footer` compound | Containers |
| `Dialog` | Full-screen on tablet | Modals, confirmations |
| `Table` | Striped rows, clickable | Data lists |
| `Select` | Native on tablet (better UX) | Dropdowns |
| `Tabs` | Large touch targets | Navigation |
| `Sheet` | Side panel for detail | Order detail on tablet |
| `Toast` | Bottom position on tablet | Notifications |
| `Skeleton` | Match card dimensions | Loading states |
| `ScrollArea` | Custom scrollbar styling | Long lists |

### 4.2 Domain Components

#### `OrderCard`

Compound component for displaying an order in lists and KDS.

```tsx
// client/src/components/orders/OrderCard.tsx
interface OrderCardProps {
  order: Order;
  variant?: 'default' | 'kds';
  onMarkReady?: () => void;
  onViewDetail?: () => void;
}

function OrderCard({ order, variant = 'default', onMarkReady, onViewDetail }: OrderCardProps) {
  if (variant === 'kds') {
    return <KDSOrderCard order={order} onMarkReady={onMarkReady} />;
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        'min-h-[120px]', // Touch target
      )}
      onClick={onViewDetail}
    >
      <Card.Header>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Mesa {order.tableId}</span>
          <StatusBadge status={order.status} />
        </div>
      </Card.Header>
      <Card.Body>
        <p className="text-sm text-neutral-500">
          {order.items.length} items · {formatCurrency(order.totalAmount)}
        </p>
      </Card.Body>
      <Card.Footer className="text-xs text-neutral-400">
        {formatTime(order.createdAt)}
      </Card.Footer>
    </Card>
  );
}

OrderCard.Header = CardHeader;
OrderCard.Body = CardBody;
OrderCard.Footer = CardFooter;
```

#### `KDSOrderCard`

Oversized card for kitchen display. Dark theme only.

```tsx
// client/src/components/kds/KDSOrderCard.tsx
function KDSOrderCard({ order, onMarkReady }: { order: Order; onMarkReady: () => void }) {
  const minutes = useOrderAge(order.createdAt);
  const agingClass = minutes > 15 ? 'border-red-600 animate-pulse'
    : minutes > 10 ? 'border-orange-500 animate-pulse'
    : minutes > 5 ? 'border-amber-500'
    : 'border-neutral-700';

  return (
    <div className={cn(
      'bg-neutral-900 border-2 rounded-xl p-6 flex flex-col justify-between',
      'min-h-[300px]',
      agingClass,
      'transition-all duration-500',
    )}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-kds-lg font-bold text-neutral-50">
            #{order.id}
          </span>
          <span className="text-kds-sm text-neutral-400">
            MESA {order.tableId}
          </span>
        </div>

        <div className="text-kds-sm text-amber-400 mb-4">
          ⏱ {Math.floor(minutes)} min
        </div>

        <ul className="space-y-3">
          {order.items.map(item => (
            <li key={item.id} className="text-kds-base text-neutral-100 flex justify-between">
              <span>
                {item.quantity}x {item.productName}
                {item.modifications && item.modifications !== 'null' && (
                  <span className="text-kds-sm text-amber-300 ml-2 block">
                    {item.modifications}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        size="kds"
        onClick={onMarkReady}
        className="mt-4 text-kds-sm"
      >
        <CheckCircle className="size-8 mr-3" />
        LISTA
      </Button>
    </div>
  );
}
```

#### `TableMap`

Interactive grid of restaurant tables.

```tsx
// client/src/components/tables/TableMap.tsx
function TableMap({ tables, onSelectTable }: TableMapProps) {
  return (
    <div className="grid gap-4 p-4" style={{
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))'
    }}>
      {tables.map(table => (
        <button
          key={table.id}
          onClick={() => onSelectTable(table)}
          className={cn(
            'aspect-square rounded-xl flex flex-col items-center justify-center',
            'text-lg font-bold transition-transform active:scale-95',
            'min-h-[120px] min-w-[120px]',
            TABLE_STATUS_STYLES[table.status],
          )}
        >
          <span className="text-2xl">{table.number}</span>
          <span className="text-sm mt-1 capitalize">{table.status}</span>
          {table.activeOrderId && (
            <span className="text-xs mt-1 bg-white/30 px-2 py-0.5 rounded-full">
              #{table.activeOrderId}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

const TABLE_STATUS_STYLES: Record<string, string> = {
  free: 'bg-green-100 text-green-800 border-2 border-green-300',
  occupied: 'bg-red-100 text-red-800 border-2 border-red-300',
  reserved: 'bg-amber-100 text-amber-800 border-2 border-amber-300',
  cleaning: 'bg-blue-100 text-blue-800 border-2 border-blue-300',
};
```

#### `ProductSelector`

Search + category filter + product grid for order taking.

```tsx
// client/src/components/orders/ProductSelector.tsx
function ProductSelector({ onAddToOrder }: ProductSelectorProps) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Category tabs - horizontal scroll on tablet */}
      <ScrollArea orientation="horizontal" className="py-2">
        <div className="flex gap-2">
          <CategoryTab active={!categoryId} onClick={() => setCategoryId(null)}>
            Todos
          </CategoryTab>
          {categories.map(cat => (
            <CategoryTab
              key={cat.id}
              active={categoryId === cat.id}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.name}
            </CategoryTab>
          ))}
        </div>
      </ScrollArea>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 p-2">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={() => onAddToOrder(product)}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      disabled={!product.isAvailable}
      className={cn(
        'rounded-xl border-2 p-4 text-left active:scale-95 transition-transform',
        'min-h-[120px]',
        product.isAvailable
          ? 'border-neutral-200 hover:border-amber-300 active:border-amber-500'
          : 'border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed',
      )}
    >
      <p className="text-lg font-semibold">{product.name}</p>
      <p className="text-sm text-neutral-500 mt-1">{product.description}</p>
      <p className="text-xl font-bold text-amber-700 mt-2">
        {formatCurrency(product.basePrice)}
      </p>
    </button>
  );
}
```

#### `ModifierPicker`

Toggle grid for adding/removing modifiers from a product.

```tsx
// client/src/components/orders/ModifierPicker.tsx
function ModifierPicker({ modifiers, selected, onToggle }: ModifierPickerProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Complementos</h3>
      <div className="grid grid-cols-1 gap-2">
        {modifiers.map(mod => (
          <label
            key={mod.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer',
              'min-h-[48px]', // Touch target
              selected.has(mod.id)
                ? 'border-amber-500 bg-amber-50'
                : 'border-neutral-200',
            )}
          >
            <span className="text-base">{mod.name}</span>
            {mod.priceAdjustment > 0 && (
              <span className="text-sm text-amber-700 ml-2">
                +{formatCurrency(mod.priceAdjustment)}
              </span>
            )}
            <input
              type="checkbox"
              checked={selected.has(mod.id)}
              onChange={() => onToggle(mod)}
              className="sr-only" // Hidden, label is the touch target
            />
          </label>
        ))}
      </div>
    </div>
  );
}
```

#### `PaymentForm`

Cash register payment form.

```tsx
// client/src/components/cash/PaymentForm.tsx
function PaymentForm({ order, onSubmit }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState<string>(String(order.totalAmount));
  const [tip, setTip] = useState<string>('');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order summary */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold">Mesa {order.tableId}</h3>
        <p className="text-2xl font-bold mt-2">{formatCurrency(order.totalAmount)}</p>
        <p className="text-sm text-neutral-500">{order.items.length} items</p>
      </div>

      {/* Payment method */}
      <div className="grid grid-cols-3 gap-3">
        {PAYMENT_METHODS.map(m => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMethod(m.value)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2',
              method === m.value ? 'border-amber-500 bg-amber-50' : 'border-neutral-200',
            )}
          >
            <m.icon className="size-6" />
            <span className="text-sm">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="text-2xl h-16"
        />
      </div>

      {/* Tip */}
      <div>
        <Label htmlFor="tip">Propina</Label>
        <div className="flex gap-2">
          {[10, 15, 20].map(pct => (
            <Button
              key={pct}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTip(String(order.totalAmount * pct / 100))}
            >
              {pct}%
            </Button>
          ))}
        </div>
        <Input
          id="tip"
          type="number"
          value={tip}
          onChange={e => setTip(e.target.value)}
          className="mt-2"
        />
      </div>

      <Button type="submit" size="lg" className="w-full text-lg h-14">
        Registrar Pago
      </Button>
    </form>
  );
}

const PAYMENT_METHODS = [
  { value: 'cash' as const, label: 'Efectivo', icon: Banknote },
  { value: 'card' as const, label: 'Tarjeta', icon: CreditCard },
  { value: 'transfer' as const, label: 'Transferencia', icon: ArrowLeftRight },
];
```

#### `StatusBadge`

Reusable status badge for orders, tables, and payments.

```tsx
// client/src/components/shared/StatusBadge.tsx
const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; icon: LucideIcon }> = {
  draft:         { label: 'Borrador',           className: 'bg-gray-100 text-gray-700',         icon: ClipboardList },
  in_kitchen:   { label: 'En Cocina',          className: 'bg-amber-100 text-amber-800',       icon: CookingPot },
  ready:         { label: 'Lista',              className: 'bg-blue-100 text-blue-800',         icon: CheckCircle },
  delivered:     { label: 'Entregada',          className: 'bg-purple-100 text-purple-800',     icon: Truck },
  paid:          { label: 'Pagada',             className: 'bg-green-100 text-green-800',       icon: Banknote },
  partially_paid:{ label: 'Pago Parcial',       className: 'bg-orange-100 text-orange-800',     icon: CreditCard },
  closed:        { label: 'Cerrada',            className: 'bg-gray-100 text-gray-700',         icon: Archive },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      config.className,
    )}>
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}
```

---

## 5. Layout Patterns

### 5.1 Mesero Layout (`/mesero`)

```tsx
// client/src/app/mesero/layout.tsx
export default function MeseroLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-dvh bg-neutral-50">
      {/* Content */}
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-white border-t flex items-center justify-around shrink-0">
        <NavItem href="/mesero/orders" icon={Utensils} label="Ordenes" active={pathname.includes('orders')} />
        <NavItem href="/mesero/tables" icon={LayoutGrid} label="Mesas" active={pathname.includes('tables')} />
        <NavItem href="/mesero/profile" icon={User} label="Perfil" active={pathname.includes('profile')} />
      </nav>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 h-full px-6',
        'min-w-[64px] min-h-[64px]',
        active ? 'text-amber-600' : 'text-neutral-400',
      )}
    >
      <Icon className="size-6" />
      <span className="text-xs">{label}</span>
    </Link>
  );
}
```

### 5.2 Cajero/Admin Layout (`/caja`, `/admin`)

```tsx
// client/src/components/layout/SidebarLayout.tsx
interface SidebarLayoutProps {
  navigation: { href: string; icon: LucideIcon; label: string }[];
  children: ReactNode;
}

export function SidebarLayout({ navigation, children }: SidebarLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold text-amber-700">SOR</h1>
        </div>
        <nav className="flex-1 py-4">
          {navigation.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-6 py-3 text-sm font-medium',
                pathname === item.href
                  ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-600'
                  : 'text-neutral-600 hover:bg-neutral-50',
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-end px-6 shrink-0">
          <UserMenu />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 5.3 KDS Layout (`/kds`)

```tsx
// client/src/app/kds/page.tsx
export default function KDSPage() {
  const { orders } = useKDSOrders();

  // Fullscreen on mount
  useEffect(() => {
    document.documentElement.requestFullscreen?.();
  }, []);

  // Wake lock to prevent screen sleep
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    async function acquireWakeLock() {
      try {
        wakeLock = await navigator.wakeLock?.request('screen');
      } catch {}
    }
    acquireWakeLock();
    return () => { wakeLock?.release(); };
  }, []);

  const inKitchen = orders.filter(o => o.status === 'in_kitchen');

  return (
    <div className="h-screen bg-neutral-950 flex flex-col overflow-hidden">
      {/* KDS Header */}
      <header className="h-20 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-kds-lg font-bold text-neutral-50">COCINA</h1>
        <div className="flex items-center gap-8">
          <span className="text-kds-base text-neutral-300">{formatTime(new Date())}</span>
          <span className="text-kds-base text-amber-400">
            {inKitchen.length} Activas
          </span>
        </div>
      </header>

      {/* Order Grid */}
      <main className="flex-1 p-4 overflow-hidden">
        {inKitchen.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={Coffee}
              title="Sin ordenes pendientes"
              description="Las ordenes entrantes apareceran aqui"
              variant="kds"
            />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 h-full">
            {inKitchen.map(order => (
              <KDSOrderCard
                key={order.id}
                order={order}
                onMarkReady={() => markAsReady(order.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 6. States

### 6.1 Loading States

Use skeleton components, never spinners for content areas.

```tsx
// Orders loading
function OrdersSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="min-h-[120px]">
          <Card.Header>
            <Skeleton className="h-6 w-32" />
          </Card.Header>
          <Card.Body>
            <Skeleton className="h-4 w-48" />
          </Card.Body>
          <Card.Footer>
            <Skeleton className="h-3 w-24" />
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
}
```

### 6.2 Empty States

```tsx
// client/src/components/shared/EmptyState.tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  variant?: 'default' | 'kds';
}

function EmptyState({ icon: Icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8',
      variant === 'kds' ? 'text-neutral-500 gap-6' : 'text-neutral-400 gap-4',
    )}>
      <Icon className={variant === 'kds' ? 'size-20 opacity-20' : 'size-16 opacity-30'} />
      <h3 className={cn('font-semibold', variant === 'kds' ? 'text-kds-lg' : 'text-lg')}>
        {title}
      </h3>
      <p className={cn('max-w-xs', variant === 'kds' ? 'text-kds-base' : 'text-sm')}>
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline" size={variant === 'kds' ? 'kds' : 'default'}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### 6.3 Error States

```tsx
// client/src/components/shared/ErrorAlert.tsx
function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="size-5 text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">Error</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 6.4 Optimistic Updates

For status changes (mark ready, send to kitchen), update UI immediately, then sync with server:

```tsx
function useOptimisticOrder(orderId: number) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: (newStatus: OrderStatus) =>
      api.put(`/api/orders/${orderId}/status`, { status: newStatus }),
    onMutate: async (newStatus) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<Order[]>(['orders']);

      // Optimistically update
      queryClient.setQueryData<Order[]>(['orders'], old =>
        old?.map(o => o.id === orderId ? { ...o, status: newStatus } : o),
      );

      return { previousOrders };
    },
    onError: (_err, _newStatus, context) => {
      // Rollback on error
      queryClient.setQueryData(['orders'], context?.previousOrders);
      toast({ title: 'Error al actualizar estado', variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return updateStatus;
}
```

---

## 7. shadcn/ui Configuration

### 7.1 Theme Override

```json
// components.json (shadcn/ui init)
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 7.2 Button Variants Extension

Add KDS variants to the base Button:

```tsx
// client/src/components/ui/button.tsx
// Extend buttonVariants with KDS sizes
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // ... shadcn defaults
        kds: 'bg-amber-600 text-white shadow hover:bg-amber-500 active:scale-95 transition-transform',
      },
      size: {
        // ... shadcn defaults
        kds: 'h-14 rounded-xl px-8 text-kds-sm font-bold', // 56px + 32px font
        'kds-lg': 'h-20 rounded-xl px-12 text-kds-lg font-bold', // 80px + 48px font
      },
    },
  },
);
```

### 7.3 `cn()` Utility

```tsx
// client/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
```

---

## 8. Accessibility (a11y) Checklist

Per screen profile:

| Rule | Mesero | Cajero/Admin | KDS |
|------|--------|-------------|-----|
| Touch target min 48x48px | Required | Recommended | N/A (no interaction beyond buttons) |
| Color contrast ratio 4.5:1 | Required | Required | Required (dark theme tests) |
| Focus visible (keyboard nav) | N/A (touch only) | Required | Required |
| `aria-label` on icon-only buttons | Required | Required | Required |
| Screen reader announcements | Required (order sent, status change) | Required (payment confirmed) | Required (new order) |
| `role` attributes | `role="button"` on custom controls | `role="table"`, `role="row"` | `role="list"`, `role="listitem"` |
| `aria-live` for dynamic content | `polite` for status changes | `polite` for payment updates | `assertive` for new orders |

---

## 9. Development Setup

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add primitives as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add sheet
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add scroll-area

# Install icons
npm install lucide-react
```

### Tailwind v4 Custom Theme

```css
/* client/src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors -- see Section 1.1 */
  --color-primary: oklch(0.705 0.2 62);
  --color-primary-light: oklch(0.87 0.15 75);
  --color-primary-dark: oklch(0.55 0.18 55);
  /* ... remaining tokens ... */

  /* KDS typography scale */
  --font-size-kds-sm: 1.5rem;    /* 24px */
  --font-size-kds-base: 2rem;    /* 32px */
  --font-size-kds-lg: 3rem;      /* 48px */
  --font-size-kds-xl: 4rem;      /* 64px */
  --font-size-kds-2xl: 5rem;     /* 80px */
}

/* Dark theme for KDS */
@variant kds (&:where([data-kds] *));

@layer base {
  body {
    @apply bg-neutral-50 text-neutral-900 antialiased;
  }

  [data-kds] {
    @apply bg-neutral-950 text-neutral-50;
    font-size: var(--font-size-kds-base);
    -webkit-font-smoothing: antialiased;
    cursor: none; /* Hide cursor for touchless KDS */
  }
}
```

---

## 10. Component Inventory (MVP Scope)

| Component | Type | Screen | Priority |
|-----------|------|--------|----------|
| `Button` | Primitive (shadcn extended) | All | P0 |
| `Input` | Primitive | All | P0 |
| `Badge` | Primitive (status variants) | All | P0 |
| `Card` | Primitive (compound) | All | P0 |
| `Dialog` | Primitive | All | P0 |
| `Table` | Primitive | Cajero, Admin | P0 |
| `Select` | Primitive | All | P1 |
| `Tabs` | Primitive | Mesero (categories) | P1 |
| `Sheet` | Primitive | Mesero (order detail) | P1 |
| `Toast` | Primitive | All | P1 |
| `Skeleton` | Primitive | All | P1 |
| `ScrollArea` | Primitive | All | P2 |
| `OrderCard` | Domain | Mesero | P0 |
| `KDSOrderCard` | Domain | KDS | P0 |
| `TableMap` | Domain | Mesero | P0 |
| `ProductSelector` | Domain | Mesero | P0 |
| `ModifierPicker` | Domain | Mesero | P0 |
| `PaymentForm` | Domain | Cajero | P0 |
| `CashRegister` | Domain | Cajero | P1 |
| `StatusBadge` | Shared | All | P0 |
| `SearchBar` | Shared | All | P1 |
| `EmptyState` | Shared | All | P1 |
| `ErrorAlert` | Shared | All | P1 |
| `UserMenu` | Shared | All | P1 |
| `SidebarLayout` | Layout | Cajero, Admin | P0 |
| `BottomNavLayout` | Layout | Mesero | P0 |
| `KDSLayout` | Layout | KDS | P0 |

P0 = MVP (Fase 1), P1 = Consolidacion (Fase 2), P2 = Optimizacion (Fase 3)
