import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/shared/Skeleton';

type TabType = 'sales' | 'products' | 'meseros' | 'caja';

function formatPrice(price: string | number) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num || 0);
}

export function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['reports', 'sales', { from, to, groupBy }],
    queryFn: () => api<{ data: Array<{ period: string; totalSales: string | null; totalTips: string | null; paymentCount: number }> }>(`/reports/sales?from=${from}&to=${to}&groupBy=${groupBy}`),
    enabled: activeTab === 'sales',
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['reports', 'top-products', { from, to }],
    queryFn: () => api<{ data: Array<{ productId: number; productName: string; totalQuantity: string; totalRevenue: string }> }>(`/reports/top-products?from=${from}&to=${to}&limit=10`),
    enabled: activeTab === 'products',
  });

  const { data: meserosData, isLoading: meserosLoading } = useQuery({
    queryKey: ['reports', 'orders-by-user', { from, to }],
    queryFn: () => api<{ data: Array<{ userId: number; userName: string; orderCount: number; totalSales: string }> }>(`/reports/orders-by-user?from=${from}&to=${to}`),
    enabled: activeTab === 'meseros',
  });

  const { data: cajaData, isLoading: cajaLoading } = useQuery({
    queryKey: ['reports', 'cash-history'],
    queryFn: () => api<{ data: Array<{ id: number; status: string; totalSales: string; totalTips: string; openedAt: string; closedAt: string | null }> }>('/reports/cash-history'),
    enabled: activeTab === 'caja',
  });

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'sales', label: 'Ventas' },
    { id: 'products', label: 'Productos' },
    { id: 'meseros', label: 'Meseros' },
    { id: 'caja', label: 'Caja' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#2C1810]">Reportes</h2>
      </div>

      {activeTab !== 'caja' && (
        <div className="flex items-center gap-3 mb-4">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="border-2 border-[#8B7355] bg-white p-2 font-['JetBrains_Mono'] text-sm text-[#2C1810]" />
          <span className="font-['DM_Sans'] text-[#5C4030]">hasta</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="border-2 border-[#8B7355] bg-white p-2 font-['JetBrains_Mono'] text-sm text-[#2C1810]" />
          {activeTab === 'sales' && (
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className="border-2 border-[#8B7355] bg-white p-2 font-['JetBrains_Mono'] text-sm text-[#2C1810]">
              <option value="day">Diario</option>
              <option value="week">Semanal</option>
              <option value="month">Mensual</option>
            </select>
          )}
        </div>
      )}

      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] ${
              activeTab === tab.id ? 'bg-[#6B1A2A] text-[#F0E6D3]' : 'border-2 border-[#8B7355] text-[#5C4030] hover:bg-[#EBDCC4]'
            }`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'sales' && (
        <SalesTab data={salesData?.data ?? []} isLoading={salesLoading} />
      )}

      {activeTab === 'products' && (
        <ProductsTab data={productsData?.data ?? []} isLoading={productsLoading} />
      )}

      {activeTab === 'meseros' && (
        <MeserosTab data={meserosData?.data ?? []} isLoading={meserosLoading} />
      )}

      {activeTab === 'caja' && (
        <CajaTab data={cajaData?.data ?? []} isLoading={cajaLoading} />
      )}
    </div>
  );
}

function SalesTab({ data, isLoading }: { data: Array<{ period: string; totalSales: string | null; totalTips: string | null; paymentCount: number }>; isLoading: boolean }) {
  if (isLoading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} variant="row" />)}</div>;

  if (data.length === 0) {
    return (
      <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
        <p className="font-['Caveat'] text-2xl text-[#8B7355]">Sin datos en este período.</p>
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => parseFloat(d.totalSales ?? '0')), 1);

  return (
    <div className="border-4 border-[#6B1A2A]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Período</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Ventas</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Propinas</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Pagos</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030] w-1/2">Gráfico</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white">
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#2C1810]">{new Date(row.period).toLocaleDateString('es-MX')}</td>
              <td className="p-4 font-['JetBrains_Mono'] font-bold text-sm text-[#2D4A22]">{formatPrice(row.totalSales ?? '0')}</td>
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#C9A84C]">{formatPrice(row.totalTips ?? '0')}</td>
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">{row.paymentCount}</td>
              <td className="p-4">
                <div className="h-4 bg-[#EBDCC4]">
                  <div className="h-full bg-[#2D4A22]" style={{ width: `${(parseFloat(row.totalSales ?? '0') / maxSales) * 100}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTab({ data, isLoading }: { data: Array<{ productId: number; productName: string; totalQuantity: string; totalRevenue: string }>; isLoading: boolean }) {
  if (isLoading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} variant="row" />)}</div>;

  if (data.length === 0) {
    return (
      <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
        <p className="font-['Caveat'] text-2xl text-[#8B7355]">Sin productos vendidos en este período.</p>
      </div>
    );
  }

  return (
    <div className="border-4 border-[#6B1A2A]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030] w-8">#</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Producto</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Cantidad</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => (
            <tr key={p.productId} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white">
              <td className="p-4 font-['JetBrains_Mono'] font-bold text-sm text-[#6B1A2A]">{i + 1}</td>
              <td className="p-4 font-['Playfair_Display'] font-bold text-base text-[#2C1810]">{p.productName}</td>
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">{p.totalQuantity}</td>
              <td className="p-4 font-['JetBrains_Mono'] font-bold text-sm text-[#2D4A22]">{formatPrice(p.totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MeserosTab({ data, isLoading }: { data: Array<{ userId: number; userName: string; orderCount: number; totalSales: string }>; isLoading: boolean }) {
  if (isLoading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} variant="row" />)}</div>;

  if (data.length === 0) {
    return (
      <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
        <p className="font-['Caveat'] text-2xl text-[#8B7355]">Sin actividad de meseros en este período.</p>
      </div>
    );
  }

  return (
    <div className="border-4 border-[#6B1A2A]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Mesero</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Órdenes</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Total Vendido</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Promedio</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.userId} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white">
              <td className="p-4 font-['Playfair_Display'] font-bold text-base text-[#2C1810]">{u.userName}</td>
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">{u.orderCount}</td>
              <td className="p-4 font-['JetBrains_Mono'] font-bold text-sm text-[#2D4A22]">{formatPrice(u.totalSales)}</td>
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">
                {formatPrice(u.orderCount > 0 ? parseFloat(u.totalSales) / u.orderCount : 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CajaTab({ data, isLoading }: { data: Array<{ id: number; status: string; totalSales: string; totalTips: string; openedAt: string; closedAt: string | null }>; isLoading: boolean }) {
  if (isLoading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} variant="row" />)}</div>;

  if (data.length === 0) {
    return (
      <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
        <p className="font-['Caveat'] text-2xl text-[#8B7355]">Sin cortes de caja registrados.</p>
      </div>
    );
  }

  return (
    <div className="border-4 border-[#6B1A2A]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Apertura</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Cierre</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Ventas</th>
            <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">Propinas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((h) => (
            <tr key={h.id} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white">
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#2C1810]">{new Date(h.openedAt).toLocaleString('es-MX')}</td>
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">{h.closedAt ? new Date(h.closedAt).toLocaleString('es-MX') : '—'}</td>
              <td className="p-4 font-['JetBrains_Mono'] font-bold text-sm text-[#2D4A22]">{formatPrice(h.totalSales)}</td>
              <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#C9A84C]">{formatPrice(h.totalTips)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
