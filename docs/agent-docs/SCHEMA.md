# SCHEMA

Source of truth: `server/src/db/schema.ts` (Drizzle).

## Enums

```
user_role:             waiter | cashier | admin | superadmin
table_status:          free | occupied | reserved | cleaning
order_status:          draft | in_kitchen | ready | delivered | paid | partially_paid | closed
order_item_status:     pending | in_kitchen | ready | cancelled
payment_method:        cash | card | transfer
tip_distribution_type: equal | individual
cash_register_status:  open | closed
```

## Tables

```
TABLE restaurants {
  id              SERIAL PK
  name            VARCHAR(100) NOT NULL
  address         VARCHAR(200)
  phone           VARCHAR(20)
  is_active       BOOLEAN NOT NULL DEFAULT true
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
}

TABLE users {
  id              SERIAL PK
  restaurant_id   INTEGER NOT NULL FK→restaurants.id
  name            VARCHAR(100) NOT NULL
  email           VARCHAR(150) NOT NULL UNIQUE
  password_hash   VARCHAR(255) NOT NULL
  role            user_role NOT NULL DEFAULT 'waiter'
  is_active       BOOLEAN NOT NULL DEFAULT true
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
}

TABLE tables {
  id              SERIAL PK
  restaurant_id   INTEGER NOT NULL FK→restaurants.id
  number          INTEGER NOT NULL
  name            VARCHAR(50)
  capacity        INTEGER NOT NULL DEFAULT 4
  position_x      INTEGER DEFAULT 0
  position_y      INTEGER DEFAULT 0
  status          table_status NOT NULL DEFAULT 'free'
  UNIQUE(restaurant_id, number)
}
-- "tables" refers to physical restaurant tables/mesas.

TABLE orders {
  id                SERIAL PK
  restaurant_id     INTEGER NOT NULL FK→restaurants.id
  table_id          INTEGER NOT NULL FK→tables.id
  user_id           INTEGER NOT NULL FK→users.id  -- waiter who created
  status            order_status NOT NULL DEFAULT 'draft'
  total_amount      NUMERIC(19,4) NOT NULL DEFAULT 0
  tip_amount        NUMERIC(19,4) DEFAULT 0
  tip_distribution  tip_distribution_type DEFAULT 'equal'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  closed_at         TIMESTAMPTZ
}

TABLE order_items {
  id              SERIAL PK
  order_id        INTEGER NOT NULL FK→orders.id ON DELETE CASCADE
  product_id      INTEGER NOT NULL FK→products.id
  quantity        INTEGER NOT NULL CHECK(quantity > 0)
  unit_price      NUMERIC(19,4) NOT NULL  -- frozen at order time, not current product price
  subtotal        NUMERIC(19,4) NOT NULL  -- quantity * unit_price + sum(modifier adjustments)
  modifications   TEXT                     -- human-readable summary or JSON array of modifier names
  status          order_item_status NOT NULL DEFAULT 'pending'
}

TABLE order_item_modifiers {
  id               SERIAL PK
  order_item_id    INTEGER NOT NULL FK→order_items.id ON DELETE CASCADE
  modifier_id      INTEGER NOT NULL FK→modifiers.id
  quantity         INTEGER NOT NULL DEFAULT 1
  price_adjustment NUMERIC(19,4) NOT NULL DEFAULT 0
}

TABLE products {
  id              SERIAL PK
  restaurant_id   INTEGER NOT NULL FK→restaurants.id
  category_id     INTEGER FK→categories.id
  name            VARCHAR(100) NOT NULL
  description     TEXT
  base_price      NUMERIC(19,4) NOT NULL CHECK(base_price > 0)
  image_url       VARCHAR(500)
  is_available    BOOLEAN NOT NULL DEFAULT true
}

TABLE categories {
  id              SERIAL PK
  restaurant_id   INTEGER NOT NULL FK→restaurants.id
  name            VARCHAR(50) NOT NULL
  sort_order      INTEGER NOT NULL DEFAULT 0
}

TABLE modifiers {
  id               SERIAL PK
  restaurant_id    INTEGER NOT NULL FK→restaurants.id
  name             VARCHAR(100) NOT NULL
  price_adjustment NUMERIC(19,4) NOT NULL DEFAULT 0
  is_available     BOOLEAN NOT NULL DEFAULT true
}

TABLE product_modifiers {
  id          SERIAL PK
  product_id  INTEGER NOT NULL FK→products.id ON DELETE CASCADE
  modifier_id INTEGER NOT NULL FK→modifiers.id ON DELETE CASCADE
  UNIQUE(product_id, modifier_id)
}

TABLE payments {
  id                SERIAL PK
  order_id          INTEGER NOT NULL FK→orders.id
  user_id           INTEGER NOT NULL FK→users.id  -- cashier
  cash_register_id  INTEGER NOT NULL FK→cash_registers.id
  amount            NUMERIC(19,4) NOT NULL CHECK(amount > 0)
  payment_method    payment_method NOT NULL
  tip_amount        NUMERIC(19,4) NOT NULL DEFAULT 0
  paid_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
}

TABLE cash_registers {
  id              SERIAL PK
  restaurant_id   INTEGER NOT NULL FK→restaurants.id
  user_id         INTEGER NOT NULL FK→users.id  -- cashier who opened
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  closed_at       TIMESTAMPTZ
  initial_amount  NUMERIC(19,4) NOT NULL DEFAULT 0
  total_sales     NUMERIC(19,4) NOT NULL DEFAULT 0
  total_tips      NUMERIC(19,4) NOT NULL DEFAULT 0
  status          cash_register_status NOT NULL DEFAULT 'open'
}

TABLE tip_distributions {
  id                SERIAL PK
  payment_id        INTEGER NOT NULL FK→payments.id ON DELETE CASCADE
  user_id           INTEGER NOT NULL FK→users.id
  amount            NUMERIC(19,4) NOT NULL
  distribution_type tip_distribution_type NOT NULL
}

TABLE audit_logs {
  id              SERIAL PK
  restaurant_id   INTEGER NOT NULL FK→restaurants.id
  user_id         INTEGER NOT NULL FK→users.id
  entity_type     VARCHAR(50) NOT NULL          -- 'order', 'payment', 'product', etc.
  entity_id       INTEGER NOT NULL
  action          VARCHAR(50) NOT NULL          -- 'create', 'update', 'delete', 'status_change'
  old_values      JSONB
  new_values      JSONB
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
}
```

## Indexes

```
TABLE       INDEX                              COLUMNS                                     TYPE     REASON
─────       ─────                              ───────                                     ────     ──────
users       users_email_key                    (email)                                     UNIQUE   login lookup
users       idx_users_restaurant_role          (restaurant_id, role)                       B-tree   filter by role per restaurant
orders      idx_orders_restaurant_status       (restaurant_id, status)                     B-tree   active orders by status
orders      idx_orders_table                   (table_id)                                  B-tree   find order by table
orders      idx_orders_user_created            (user_id, created_at DESC)                  B-tree   waiter order history
orders      idx_orders_status_kitchen          (status, created_at) WHERE in_kitchen       PARTIAL  KDS FIFO queue
order_items idx_order_items_order              (order_id)                                  B-tree   JOIN with orders
products    idx_products_restaurant_available  (restaurant_id, is_available)               B-tree   active catalog per restaurant
products    idx_products_name_search           USING GIN(to_tsvector('spanish', name))     GIN      catalog full-text search
payments    idx_payments_cash_register         (cash_register_id)                          B-tree   payments in a cash register
payments    idx_payments_paid_at               (paid_at)                                   B-tree   report by date
tip_dists   idx_tips_user                      (user_id, distribution_type)                B-tree   tips per employee
audit_logs  idx_audit_entity                   (entity_type, entity_id)                    B-tree   audit trail per entity
audit_logs  idx_audit_created                  (created_at DESC)                           B-tree   audit by date

Key for partial index format: CREATE INDEX ... WHERE status = 'in_kitchen'
```

## Notes

- Money: always `NUMERIC(19,4)`. Never `FLOAT`, `REAL`, or `DECIMAL` without precision.
- Timestamps: always `TIMESTAMPTZ`. Never `TIMESTAMP` without timezone.
- Soft delete: `is_active = false` for users, products, modifiers. Preserves referential integrity.
- Multi-sucursal: `restaurant_id` on all core tables. MVP uses fixed value `1`. No migration needed later.
- `order_items.unit_price` is frozen at order time. Changes to `products.base_price` do not affect existing orders.
- Audit trail: `audit_logs` captures critical actions (order modifications, payment corrections). JSONB columns for flexibility.
