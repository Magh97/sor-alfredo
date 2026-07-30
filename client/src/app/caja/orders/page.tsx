import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getStoredUser } from '@/lib/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useSocket } from '@/hooks/useSocket';
import { X, Check, CreditCard } from 'lucide-react';

const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', in_kitchen: 'En Cocina', ready: 'Listo',
  delivered: 'Entregado', partially_paid: 'Pago Parcial', paid: 'Pagado', closed: 'Cerrado',
};

const STATUS_BADGE_VARIANT: Record<string, string> = {
  draft: 'muted', in_kitchen: 'warning', ready: 'success',
  delivered: 'info', partially_paid: 'primary', paid: 'success', closed: 'muted',
};

function formatPrice(price: string) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(price));
}

interface Order {
  id: number;
  tableId: number;
  userId: number;
  status: string;
  totalAmount: string;
  createdAt: string;
  table?: { number: number };
  user?: { name: string };
}

export function CajeroOrdersPage() {
  const user = getStoredUser();
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  useSocket(user?.restaurantId);

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api<{ data: Order[] }>('/orders?pageSize=100'),
  });

  const { data: tablesData } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api<{ data: Array<{ id: number; number: number }> }>('/tables'),
  });

  const { data: registerData } = useQuery({
    queryKey: ['cash-register', 'current'],
    queryFn: () => api<{ data: { id: number; status: string } }>('/cash-register/current'),
    retry: false,
  });

  const orders = (ordersData?.data ?? []).filter((o) => !statusFilter || o.status === statusFilter);
  const tables = tablesData?.data ?? [];
  const hasOpenRegister = !!registerData?.data;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#2C1810]">
          {orders.length} Órdenes
        </h2>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }}
            className="border-2 border-[#8B7355] bg-white px-3 py-2 font-['JetBrains_Mono'] text-sm text-[#2C1810]">
            <option value="">Todos los estados</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {!hasOpenRegister && (
        <div className="bg-[#C9A84C]/10 border-2 border-[#C9A84C] p-4 mb-4">
          <p className="font-['DM_Sans'] font-bold text-sm text-[#C9A84C]">
            No hay turno de caja abierto. Ve a la sección de Caja para abrir un turno.
          </p>
        </div>
      )}

      {payingOrder && (
        <PaymentForm
          order={payingOrder}
          tableNumber={tables.find((t) => t.id === payingOrder.tableId)?.number ?? payingOrder.tableId}
          onClose={() => { setPayingOrder(null); }}
        />
      )}

      {orders.length === 0 ? (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <p className="font-['Caveat'] text-2xl text-[#8B7355]">Sin órdenes para mostrar.</p>
        </div>
      ) : (
        <div className="border-4 border-[#6B1A2A]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
                {['#', 'Mesa', 'Mesero', 'Estado', 'Total', 'Acción'].map((h) => (
                  <th key={h} className={`p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030] ${h === 'Acción' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white hover:bg-[#EBDCC4]/30 transition-colors">
                  <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#2C1810]">#{order.id}</td>
                  <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">
                    M{order.table?.number ?? order.tableId}
                  </td>
                  <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">
                    {order.user?.name ?? '—'}
                  </td>
                  <td className="p-4">
                    <StatusBadge label={ORDER_STATUS_LABELS[order.status] ?? order.status} variant={STATUS_BADGE_VARIANT[order.status] ?? 'muted'} />
                  </td>
                  <td className="p-4 font-['JetBrains_Mono'] font-bold text-sm text-[#2D4A22]">{formatPrice(order.totalAmount)}</td>
                  <td className="p-4 text-right">
                    {(order.status === 'delivered' || order.status === 'partially_paid') && hasOpenRegister && (
                      <button onClick={() => { setPayingOrder(order); }}
                        className="bg-[#2D4A22] text-[#F0E6D3] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-3 py-2 hover:bg-[#3D6230]">
                        <CreditCard size={14} className="inline mr-1" /> Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaymentForm({ order, tableNumber, onClose }: { order: Order; tableNumber: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(order.totalAmount);
  const [method, setMethod] = useState('cash');
  const [tip, setTip] = useState('0');
  const [distribution, setDistribution] = useState('equal');
  const [error, setError] = useState<string | null>(null);

  const paymentMutation = useMutation({
    mutationFn: () => api(`/orders/${order.id}/payment`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod: method, tipAmount: tip, tipDistribution: distribution }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register'] });
      onClose();
    },
    onError: (err: { message?: string }) => { setError(err.message ?? 'Error al procesar pago'); },
  });

  const change = parseFloat(amount) - parseFloat(order.totalAmount);

  return (
    <div className="fixed inset-0 bg-[#2C1810]/50 flex items-center justify-center z-50 p-6">
      <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-8 w-full max-w-md"
        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Playfair_Display'] font-bold text-2xl text-[#6B1A2A]">Cobrar #{order.id}</h3>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#6B1A2A]"><X size={20} /></button>
        </div>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between font-['JetBrains_Mono'] text-[#5C4030]">
            <span>Mesa {tableNumber}</span>
            <span>Total: {formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Monto recibido</label>
            <input type="text" value={amount} onChange={(e) => { setAmount(e.target.value); }}
              className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
          </div>

          <div>
            <label className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Método de pago</label>
            <div className="flex gap-2 mt-1">
              {[{ id: 'cash', label: 'Efectivo' }, { id: 'card', label: 'Tarjeta' }, { id: 'transfer', label: 'Transferencia' }].map((m) => (
                <button key={m.id} onClick={() => { setMethod(m.id); }}
                  className={`flex-1 py-2 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] border-2 transition-colors ${
                    method === m.id ? 'bg-[#6B1A2A] text-[#F0E6D3] border-[#6B1A2A]' : 'bg-white text-[#5C4030] border-[#8B7355]'
                  }`}>{m.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Propina</label>
            <input type="text" value={tip} onChange={(e) => { setTip(e.target.value); }}
              className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
          </div>

          {parseFloat(tip) > 0 && (
            <div>
              <label className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Distribución</label>
              <div className="flex gap-2 mt-1">
                {[{ id: 'equal', label: 'Equitativa' }, { id: 'individual', label: 'Mesero' }].map((d) => (
                  <button key={d.id} onClick={() => { setDistribution(d.id); }}
                    className={`flex-1 py-2 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] border-2 transition-colors ${
                      distribution === d.id ? 'bg-[#6B1A2A] text-[#F0E6D3] border-[#6B1A2A]' : 'bg-white text-[#5C4030] border-[#8B7355]'
                    }`}>{d.label}</button>
                ))}
              </div>
            </div>
          )}

          {change >= 0 && (
            <div className="bg-[#2D4A22]/10 border-2 border-[#2D4A22] p-3 flex justify-between">
              <span className="font-['DM_Sans'] font-bold text-xs uppercase text-[#2D4A22]">Cambio</span>
              <span className="font-['JetBrains_Mono'] font-bold text-lg text-[#2D4A22]">{formatPrice(change.toFixed(4))}</span>
            </div>
          )}

          {error && (
            <p className="font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">{error}</p>
          )}

          <button onClick={() => { paymentMutation.mutate(); }} disabled={paymentMutation.isPending}
            className="w-full bg-[#2D4A22] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] p-4 hover:bg-[#3D6230] disabled:opacity-50">
            <Check size={16} className="inline mr-1" />
            {paymentMutation.isPending ? 'Procesando...' : 'Cobrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
