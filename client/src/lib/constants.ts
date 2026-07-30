export const ROLES = ['waiter', 'cashier', 'admin', 'superadmin'] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUS = [
  'draft',
  'in_kitchen',
  'ready',
  'delivered',
  'partially_paid',
  'paid',
  'closed',
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export const TABLE_STATUS = ['free', 'occupied', 'reserved', 'cleaning'] as const;
export type TableStatus = (typeof TABLE_STATUS)[number];

export const PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Borrador',
  in_kitchen: 'En Cocina',
  ready: 'Listo',
  delivered: 'Entregado',
  partially_paid: 'Pago Parcial',
  paid: 'Pagado',
  closed: 'Cerrado',
};

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  free: 'Libre',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  cleaning: 'Limpieza',
};

export const ROLE_LABELS: Record<Role, string> = {
  waiter: 'Mesero',
  cashier: 'Cajero',
  admin: 'Administrador',
  superadmin: 'Super Admin',
};
