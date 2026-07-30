import { useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { KDSLayout } from '@/components/layout/KDSLayout';
import { useOrderAge } from '@/hooks/useOrderAge';
import { getStoredUser } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  modifications: string | null;
  modifiers: Array<{ modifierId: number; priceAdjustment: string }>;
}

interface Order {
  id: number;
  tableId: number;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
  table: { number: number };
}

const AGE_BORDERS: Record<string, string> = {
  normal: 'border-[#2A1F18]',
  attention: 'border-[#C9A84C]',
  warning: 'border-[#E8913A]',
  critical: 'border-[#8B1A1A]',
};

const AGE_BG: Record<string, string> = {
  normal: 'bg-[#1E1814]',
  attention: 'bg-[#1E1814]',
  warning: 'bg-[#1E1814]',
  critical: 'bg-[#8B1A1A]/15',
};

function formatTime(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function KdsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const user = getStoredUser();

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', String(user?.restaurantId ?? 1));
    });

    socket.on('order:new', (order: Order) => {
      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        return [{ ...order, _entering: true }, ...prev];
      });
      setTimeout(() => {
        setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, _entering: false } : o));
      }, 500);
    });

    socket.on('order:status-changed', (order: Order) => {
      if (order.status === 'ready' || order.status === 'closed') {
        setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, _leaving: true } : o));
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o.id !== order.id));
        }, 400);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.restaurantId]);

  function handleReady(orderId: number) {
    socketRef.current?.emit('order:ready', { orderId, restaurantId: user?.restaurantId ?? 1 });
  }

  return (
    <KDSLayout>
      <div className="flex items-center justify-between mb-4">
        <span className="font-['JetBrains_Mono'] font-bold text-lg text-[#8B7355]">
          {orders.length} {orders.length === 1 ? 'activa' : 'activas'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="font-['JetBrains_Mono'] font-bold text-5xl text-[#F0E6D3] opacity-30">Esperando órdenes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 auto-rows-min h-full overflow-y-auto">
          {orders.map((order: Record<string, unknown>) => (
            <KdsOrderCard
              key={order.id as number}
              order={order as unknown as Order}
              onReady={handleReady}
            />
          ))}
        </div>
      )}
    </KDSLayout>
  );
}

function KdsOrderCard({ order, onReady }: { order: Order; onReady: (id: number) => void }) {
  const { minutes, level } = useOrderAge(order.createdAt);
  const animateEnter = (order as Record<string, unknown>)._entering;
  const animateLeave = (order as Record<string, unknown>)._leaving;

  return (
    <div
      className={cn(
        AGE_BG[level],
        'border-4 p-4 relative transition-all duration-300',
        animateEnter ? 'animate-slide-bounce' : '',
        animateLeave ? 'animate-slide-out scale-95 opacity-0' : '',
        level !== 'normal' ? AGE_BORDERS[level] : 'border-[#2A1F18]',
        level === 'critical' ? 'animate-pulse-fast' : '',
      )}
      style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}
    >
      {(level === 'warning' || level === 'critical') && (
        <div className="absolute -top-2 -right-2">
          <AlertTriangle size={20} className={level === 'critical' ? 'text-[#8B1A1A]' : 'text-[#E8913A]'} />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-['JetBrains_Mono'] font-bold text-3xl text-[#F0E6D3]">
            #{order.id}
          </span>
          <span className="font-['JetBrains_Mono'] text-lg text-[#8B7355] ml-3">
            M{order.table.number}
          </span>
        </div>
        <span className="font-['JetBrains_Mono'] text-sm text-[#8B7355]">
          {formatTime(order.createdAt)} ({minutes}m)
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="border-b border-[#2A1F18]/50 pb-1">
            <div className="flex justify-between">
              <span className="font-['JetBrains_Mono'] text-lg text-[#F0E6D3]">
                {item.quantity}x P{item.productId}
              </span>
            </div>
            {item.modifiers?.length > 0 && (
              <div className="ml-2">
                {item.modifiers.map((m) => (
                  <span key={m.modifierId} className="font-['JetBrains_Mono'] text-xs text-[#8B7355] block">
                    • M{m.modifierId}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => onReady(order.id)}
        className="w-full bg-[#2D4A22] text-[#F0E6D3] font-['JetBrains_Mono'] font-bold text-2xl uppercase tracking-[0.1em] py-4 hover:bg-[#3D6230] active:bg-[#1D3A16] transition-colors duration-150"
      >
        LISTA
      </button>
    </div>
  );
}
