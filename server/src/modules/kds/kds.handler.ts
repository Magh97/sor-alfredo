import type { Server as SocketIOServer } from 'socket.io';
import { OrdersService } from '../orders/orders.service.js';

export function registerKdsHandlers(io: SocketIOServer) {
  io.on('connection', (socket) => {
    socket.on('join', (room: string) => {
      socket.join(room);
    });

    socket.on('order:ready', async (data: { orderId: number; restaurantId: number }) => {
      try {
        const order = await OrdersService.changeStatus(data.orderId, data.restaurantId, 'ready');
        const updated = await OrdersService.getById(data.orderId, data.restaurantId);
        io.to(String(data.restaurantId)).emit('order:status-changed', updated);
      } catch {
        socket.emit('error', { message: 'No se pudo marcar la orden como lista' });
      }
    });

    socket.on('order:cancelled', async (data: { orderId: number; restaurantId: number }) => {
      try {
        const order = await OrdersService.changeStatus(data.orderId, data.restaurantId, 'closed');
        io.to(String(data.restaurantId)).emit('order:status-changed', order);
      } catch {
        socket.emit('error', { message: 'No se pudo cancelar la orden' });
      }
    });
  });
}
