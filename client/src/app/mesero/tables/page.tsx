import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, getStoredUser } from '@/lib/api';
import { Skeleton } from '@/components/shared/Skeleton';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

const TABLE_STATUS_LABELS: Record<string, string> = {
  free: 'Libre',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  cleaning: 'Limpieza',
};

export function MeseroTablesPage() {
  const user = getStoredUser();
  const navigate = useNavigate();
  useSocket(user?.restaurantId);

  const { data: tablesData, isLoading, isError } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api<{ data: Array<{ id: number; number: number; name: string | null; capacity: number; positionX: number; positionY: number; status: string }> }>('/tables'),
  });

  const tables = tablesData?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#2C1810]">
          {tables.length} Mesas
        </h2>
        <button
          onClick={() => navigate('/mesero/orders')}
          className="flex items-center gap-2 bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-5 py-3 hover:bg-[#8B2535]"
        >
          <ShoppingBag size={18} /> Órdenes
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : isError ? (
        <div className="bg-[#8B1A1A]/10 border-2 border-[#8B1A1A] p-4">
          <p className="font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">El tintero se ha volcado.</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <p className="font-['Caveat'] text-2xl text-[#8B7355]">Sin mesas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {tables.map((table, index) => (
            <button
              key={table.id}
              onClick={() => navigate(`/mesero/orders?tableId=${table.id}`)}
              className={cn(
                'bg-[#EBDCC4] border-4 p-4 text-left transition-all active:scale-[0.98]',
                table.status === 'free' ? 'border-[#2D4A22]' :
                table.status === 'occupied' ? 'border-[#6B1A2A]' :
                table.status === 'reserved' ? 'border-[#C9A84C]' :
                'border-[#3A5068]',
              )}
              style={{
                clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)',
                transform: `rotate(${(index % 3) - 1}deg)`,
              }}
            >
              <span className="font-['JetBrains_Mono'] font-bold text-3xl text-[#2C1810]">{table.number}</span>
              <div className="mt-1">
                <span className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em]" style={{ color: table.status === 'free' ? '#2D4A22' : table.status === 'occupied' ? '#6B1A2A' : '#8B7355' }}>
                  {TABLE_STATUS_LABELS[table.status] ?? table.status}
                </span>
              </div>
              <p className="font-['JetBrains_Mono'] text-xs text-[#8B7355] mt-1">{table.capacity} pers.</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
