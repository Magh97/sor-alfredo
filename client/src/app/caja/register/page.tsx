import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getStoredUser } from '@/lib/api';
import { Skeleton } from '@/components/shared/Skeleton';
import { useSocket } from '@/hooks/useSocket';
import { X, Lock, Unlock } from 'lucide-react';

function formatPrice(price: string | number) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
}

export function CajeroRegisterPage() {
  const user = getStoredUser();
  const queryClient = useQueryClient();
  const [showOpen, setShowOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState('0');
  useSocket(user?.restaurantId);

  const { data: registerData, isLoading } = useQuery({
    queryKey: ['cash-register', 'current'],
    queryFn: () => api<{ data: { id: number; status: string; initialAmount: string; totalSales: string; totalTips: string; openedAt: string; payments?: Array<{ amount: string; paymentMethod: string; tipAmount: string }> } }>('/cash-register/current'),
    retry: false,
  });

  const { data: historyData } = useQuery({
    queryKey: ['cash-register', 'history'],
    queryFn: () => api<{ data: Array<{ id: number; status: string; totalSales: string; totalTips: string; openedAt: string; closedAt: string | null }> }>('/cash-register/history'),
    enabled: !!user && (user.role === 'admin' || user.role === 'superadmin'),
  });

  const openMutation = useMutation({
    mutationFn: () => api('/cash-register/open', { method: 'POST', body: JSON.stringify({ initialAmount }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-register'] });
      setShowOpen(false);
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => api('/cash-register/close', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cash-register'] }),
  });

  const register = registerData?.data;
  const history = historyData?.data ?? [];

  if (isLoading) return <Skeleton variant="card" />;

  return (
    <div>
      <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#2C1810] mb-6">Caja</h2>

      {!register ? (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <p className="font-['Caveat'] text-2xl text-[#8B7355]">No hay turno de caja abierto.</p>
          <button onClick={() => { setShowOpen(true); }}
            className="mt-4 bg-[#2D4A22] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-6 py-3 hover:bg-[#3D6230]">
            <Unlock size={16} className="inline mr-1" /> Abrir Turno
          </button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-4"
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
              <p className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Ventas Totales</p>
              <p className="font-['JetBrains_Mono'] font-bold text-2xl text-[#2D4A22] mt-1">{formatPrice(register.totalSales)}</p>
            </div>
            <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-4"
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
              <p className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Propinas</p>
              <p className="font-['JetBrains_Mono'] font-bold text-2xl text-[#C9A84C] mt-1">{formatPrice(register.totalTips)}</p>
            </div>
            <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-4"
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
              <p className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Inicio</p>
              <p className="font-['JetBrains_Mono'] font-bold text-lg text-[#5C4030] mt-1">
                {new Date(register.openedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {register.payments && register.payments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030] mb-2">Pagos del turno ({register.payments.length})</h3>
              <div className="border-2 border-[#8B7355]/30">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#EBDCC4]/50">
                      <th className="text-left p-2 font-['DM_Sans'] font-bold text-xs text-[#5C4030]">Monto</th>
                      <th className="text-left p-2 font-['DM_Sans'] font-bold text-xs text-[#5C4030]">Método</th>
                      <th className="text-left p-2 font-['DM_Sans'] font-bold text-xs text-[#5C4030]">Propina</th>
                    </tr>
                  </thead>
                  <tbody>
                    {register.payments.map((p, i) => (
                      <tr key={i} className="border-t border-[#8B7355]/20">
                        <td className="p-2 font-['JetBrains_Mono'] text-sm text-[#2D4A22]">{formatPrice(p.amount)}</td>
                        <td className="p-2 font-['JetBrains_Mono'] text-xs text-[#5C4030]">{p.paymentMethod === 'cash' ? 'Efectivo' : p.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}</td>
                        <td className="p-2 font-['JetBrains_Mono'] text-sm text-[#C9A84C]">{formatPrice(p.tipAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button onClick={() => { closeMutation.mutate(); }} disabled={closeMutation.isPending}
            className="bg-[#8B1A1A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-6 py-3 hover:bg-[#6B1A2A] disabled:opacity-50">
            <Lock size={16} className="inline mr-1" />
            {closeMutation.isPending ? 'Cerrando...' : 'Cerrar Turno'}
          </button>
        </div>
      )}

      {showOpen && (
        <div className="fixed inset-0 bg-[#2C1810]/50 flex items-center justify-center z-50 p-6">
          <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-8 w-full max-w-sm"
            style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
            <h3 className="font-['Playfair_Display'] font-bold text-2xl text-[#6B1A2A]">Abrir Turno</h3>
            <div className="mt-4">
              <label className="font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Monto inicial</label>
              <input type="text" value={initialAmount} onChange={(e) => { setInitialAmount(e.target.value); }}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none mt-1" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowOpen(false); }}
                className="flex-1 border-2 border-[#6B1A2A] text-[#6B1A2A] font-['DM_Sans'] font-bold text-xs uppercase p-3"><X size={14} className="inline mr-1" /> Cancelar</button>
              <button onClick={() => { openMutation.mutate(); }} disabled={openMutation.isPending}
                className="flex-1 bg-[#2D4A22] text-[#F0E6D3] font-['DM_Sans'] font-bold text-xs uppercase p-3 disabled:opacity-50">{openMutation.isPending ? 'Abriendo...' : 'Abrir'}</button>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030] mb-2">Historial de Cortes</h3>
          <div className="border-2 border-[#8B7355]/30">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EBDCC4]/50">
                  <th className="text-left p-2 font-['DM_Sans'] font-bold text-xs text-[#5C4030]">Apertura</th>
                  <th className="text-left p-2 font-['DM_Sans'] font-bold text-xs text-[#5C4030]">Cierre</th>
                  <th className="text-left p-2 font-['DM_Sans'] font-bold text-xs text-[#5C4030]">Ventas</th>
                  <th className="text-left p-2 font-['DM_Sans'] font-bold text-xs text-[#5C4030]">Propinas</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-[#8B7355]/20">
                    <td className="p-2 font-['JetBrains_Mono'] text-xs text-[#5C4030]">{new Date(h.openedAt).toLocaleString('es-MX')}</td>
                    <td className="p-2 font-['JetBrains_Mono'] text-xs text-[#5C4030]">{h.closedAt ? new Date(h.closedAt).toLocaleString('es-MX') : '—'}</td>
                    <td className="p-2 font-['JetBrains_Mono'] text-sm text-[#2D4A22]">{formatPrice(h.totalSales)}</td>
                    <td className="p-2 font-['JetBrains_Mono'] text-sm text-[#C9A84C]">{formatPrice(h.totalTips)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
