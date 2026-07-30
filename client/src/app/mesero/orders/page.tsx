import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getStoredUser, getAccessToken } from '@/lib/api';
import { Skeleton } from '@/components/shared/Skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import { Plus, Send, Search, X, Check, Clock, ShoppingCart } from 'lucide-react';

const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  in_kitchen: 'En Cocina',
  ready: 'Listo',
  delivered: 'Entregado',
  partially_paid: 'Pago Parcial',
  paid: 'Pagado',
  closed: 'Cerrado',
};

const STATUS_BADGE_VARIANT: Record<string, string> = {
  draft: 'muted',
  in_kitchen: 'warning',
  ready: 'success',
  delivered: 'info',
  partially_paid: 'primary',
  paid: 'success',
  closed: 'muted',
};

function formatPrice(price: string) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(price));
}

function useQueryParam(key: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue(params.get(key));
  }, [key]);
  return value;
}

export function MeseroOrdersPage() {
  const user = getStoredUser();
  const queryClient = useQueryClient();
  const tableIdParam = useQueryParam('tableId');
  const [showNewOrder, setShowNewOrder] = useState(!!tableIdParam);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(tableIdParam ? parseInt(tableIdParam) : null);
  const [search, setSearch] = useState('');

  useSocket(user?.restaurantId);

  const { data: ordersData, isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ['orders', { userId: user?.id }],
    queryFn: () => api<{ data: unknown[] }>(`/orders?userId=${user?.id}`),
  });

  const { data: tablesData } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api<{ data: Array<{ id: number; number: number; name: string | null; status: string }> }>('/tables'),
  });

  const orders = ordersData?.data ?? [];
  const tables = tablesData?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#2C1810]">
          {orders.length} Órdenes
        </h2>
        <div className="flex gap-2">
          <button onClick={() => { setSelectedTableId(null); setShowNewOrder(!showNewOrder); }}
            className="bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-5 py-3 hover:bg-[#8B2535] flex items-center gap-1">
            <Plus size={16} /> Nueva Orden
          </button>
        </div>
      </div>

      {showNewOrder && (
        <NewOrderSheet
          tables={tables}
          defaultTableId={selectedTableId}
          onClose={() => setShowNewOrder(false)}
        />
      )}

      {ordersLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : ordersError ? (
        <div className="bg-[#8B1A1A]/10 border-2 border-[#8B1A1A] p-4">
          <p className="font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">El tintero se ha volcado.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <p className="font-['Caveat'] text-2xl text-[#8B7355]">Ninguna orden activa.</p>
          <p className="font-['Caveat'] text-lg text-[#8B7355] mt-1">¿Un café para empezar?</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Record<string, unknown>) => {
            const table = tables.find((t) => t.id === (order.tableId as number));
            return (
              <div key={order.id as number}
                className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-4"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-['JetBrains_Mono'] font-bold text-2xl text-[#2C1810]">#{order.id}</span>
                    <span className="font-['JetBrains_Mono'] text-sm text-[#5C4030]">
                      Mesa {table?.number ?? order.tableId}
                    </span>
                    <StatusBadge
                      label={ORDER_STATUS_LABELS[order.status as string] ?? (order.status as string)}
                      variant={STATUS_BADGE_VARIANT[order.status as string] ?? 'muted'}
                    />
                  </div>
                  {order.status === 'draft' && (
                    <button
                      onClick={() => {
                        const token = getAccessToken();
                        fetch(`/api/orders/${order.id}/send-to-kitchen`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                        }).then(() => queryClient.invalidateQueries({ queryKey: ['orders'] }));
                      }}
                      className="flex items-center gap-1 bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-4 py-2 hover:bg-[#8B2535]"
                    >
                      <Send size={14} /> Enviar
                    </button>
                  )}
                </div>

                <div className="text-right border-t-2 border-[#8B7355]/30 pt-2 mt-2">
                  <span className="font-['JetBrains_Mono'] font-bold text-lg text-[#2D4A22]">
                    {formatPrice(order.totalAmount as string)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewOrderSheet({
  tables,
  defaultTableId,
  onClose,
}: {
  tables: Array<{ id: number; number: number; name: string | null; status: string }>;
  defaultTableId: number | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tableId, setTableId] = useState<number | null>(defaultTableId);
  const [items, setItems] = useState<Array<{ productId: number; productName: string; basePrice: string; quantity: number; modifierIds: number[] }>>([]);
  const [search, setSearch] = useState('');

  const { data: productsData } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: () => api<{ data: Array<{ id: number; name: string; basePrice: string; categoryId: number | null; modifierIds: number[] }> }>('/catalog/products'),
  });

  const { data: modifiersData } = useQuery({
    queryKey: ['catalog', 'modifiers'],
    queryFn: () => api<{ data: Array<{ id: number; name: string; priceAdjustment: string }> }>('/catalog/modifiers'),
  });

  const createMutation = useMutation({
    mutationFn: () => api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        tableId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, modifierIds: i.modifierIds })),
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      onClose();
    },
  });

  const products = productsData?.data ?? [];
  const modifiers = modifiersData?.data ?? [];
  const filteredProducts = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const freeTables = tables.filter((t) => t.status === 'free' || t.id === defaultTableId);
  const total = items.reduce((sum, i) => sum + parseFloat(i.basePrice) * i.quantity, 0);

  return (
    <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] mb-6"
      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
      <div className="flex items-center justify-between px-6 py-4 border-b-4 border-[#6B1A2A]">
        <h3 className="font-['Playfair_Display'] font-bold text-2xl text-[#6B1A2A]">Nueva Orden</h3>
        <button onClick={onClose} className="text-[#8B7355] hover:text-[#6B1A2A]">
          <X size={20} />
        </button>
      </div>

      <div className="flex border-b-4 border-[#6B1A2A]">
        {[1, 2, 3].map((s) => (
          <button key={s} onClick={() => setStep(s as 1 | 2 | 3)}
            className={cn('flex-1 py-3 font-[\'DM_Sans\'] font-bold text-xs uppercase tracking-[0.1em] text-center transition-colors',
              step === s ? 'bg-[#6B1A2A] text-[#F0E6D3]' : 'text-[#5C4030] hover:bg-[#E5D4B8]')}>
            {s === 1 ? '1. Mesa' : s === 2 ? `2. Productos (${items.length})` : `3. Revisar (${formatPrice(total.toFixed(4))})`}
          </button>
        ))}
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="grid grid-cols-3 gap-3 min-h-[200px]">
            {freeTables.map((t) => (
              <button key={t.id} onClick={() => { setTableId(t.id); setStep(2); }}
                className={cn('border-2 p-4 text-center transition-colors',
                  tableId === t.id ? 'border-[#6B1A2A] bg-[#6B1A2A]/10' : 'border-[#8B7355] bg-white hover:border-[#6B1A2A]')}>
                <span className="font-['JetBrains_Mono'] font-bold text-2xl text-[#2C1810]">{t.number}</span>
                {t.name && <p className="font-['JetBrains_Mono'] text-xs text-[#8B7355] mt-1">{t.name}</p>}
              </button>
            ))}
            {freeTables.length === 0 && (
              <p className="col-span-3 text-center font-['Caveat'] text-xl text-[#8B7355] py-8">No hay mesas libres</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar productos..." />
            <div className="grid grid-cols-2 gap-3 mt-4 min-h-[200px]">
              {filteredProducts.map((p) => (
                <button key={p.id} onClick={() => {
                  const existing = items.find((i) => i.productId === p.id);
                  if (existing) {
                    setItems(items.map((i) => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
                  } else {
                    setItems([...items, { productId: p.id, productName: p.name, basePrice: p.basePrice, quantity: 1, modifierIds: [] }]);
                  }
                }}
                  className="border-2 border-[#8B7355] bg-white p-3 text-left hover:border-[#6B1A2A] transition-colors">
                  <span className="font-['Playfair_Display'] font-bold text-base text-[#2C1810]">{p.name}</span>
                  <span className="block font-['JetBrains_Mono'] text-sm text-[#2D4A22] mt-1">{formatPrice(p.basePrice)}</span>
                </button>
              ))}
            </div>

            {items.length > 0 && (
              <div className="mt-4 border-t-2 border-[#8B7355]/30 pt-4">
                <p className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030] mb-2">Agregados ({items.length})</p>
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between py-2 border-b border-[#8B7355]/20">
                    <div>
                      <span className="font-['Playfair_Display'] text-[#2C1810]">{item.productName}</span>
                      <span className="font-['JetBrains_Mono'] text-xs text-[#8B7355] ml-2">x{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        if (item.quantity <= 1) setItems(items.filter((i) => i.productId !== item.productId));
                        else setItems(items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity - 1 } : i));
                      }}
                        className="text-[#8B1A1A] font-bold px-2">−</button>
                      <button onClick={() => setItems(items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))}
                        className="text-[#2D4A22] font-bold px-2">+</button>
                      <span className="font-['JetBrains_Mono'] text-sm text-[#2D4A22]">{formatPrice((parseFloat(item.basePrice) * item.quantity).toFixed(4))}</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between mt-3">
                  <button onClick={() => setStep(1)} className="font-['DM_Sans'] font-bold text-xs uppercase text-[#8B7355]">
                    ← Mesa
                  </button>
                  <button onClick={() => setStep(3)}
                    className="bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-4 py-2">
                    Revisar → {formatPrice(total.toFixed(4))}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="min-h-[200px]">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Mesa</span>
                <span className="font-['JetBrains_Mono'] text-sm text-[#2C1810]">
                  {tables.find((t) => t.id === tableId)?.number ?? tableId}
                </span>
              </div>
              <div className="border-t-2 border-[#8B7355]/30 pt-3">
                <span className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Items</span>
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between py-1">
                    <span className="font-['JetBrains_Mono'] text-sm text-[#2C1810]">{item.productName} x{item.quantity}</span>
                    <span className="font-['JetBrains_Mono'] text-sm text-[#2D4A22]">
                      {formatPrice((parseFloat(item.basePrice) * item.quantity).toFixed(4))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-[#8B7355]/30 pt-3 flex justify-between">
                <span className="font-['Playfair_Display'] font-bold text-lg text-[#2C1810]">Total</span>
                <span className="font-['JetBrains_Mono'] font-bold text-xl text-[#2D4A22]">{formatPrice(total.toFixed(4))}</span>
              </div>
            </div>

            {createMutation.error && (
              <p className="mt-4 font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">
                {(createMutation.error as { message?: string }).message ?? 'Error al crear orden'}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)}
                className="flex-1 border-2 border-[#6B1A2A] text-[#6B1A2A] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] p-3">
                ← Productos
              </button>
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
                className="flex-1 bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] p-3 hover:bg-[#8B2535] disabled:opacity-50 flex items-center justify-center gap-2">
                <Send size={16} />
                {createMutation.isPending ? 'Creando...' : 'Crear y Enviar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
