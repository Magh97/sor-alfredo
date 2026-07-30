import type { Server as SocketIOServer } from 'socket.io';
import { OrdersService } from '../orders/orders.service.js';

export function registerKdsHandlers(io: SocketIOServer) {
  io.on('connection', (socket) => {
    socket.on('join', (room: string) => {
      void socket.join(room);
    });

    socket.on('order:ready', (data: { orderId: number; restaurantId: number }) => {
      OrdersService.changeStatus(data.orderId, data.restaurantId, 'ready')
        .then(() => OrdersService.getById(data.orderId, data.restaurantId))
        .then((updated) => { io.to(String(data.restaurantId)).emit('order:status-changed', updated); })
        .catch(() => { socket.emit('error', { message: 'No se pudo marcar la orden como lista' }); });
    });

    socket.on('order:cancelled', (data: { orderId: number; restaurantId: number }) => {
      OrdersService.changeStatus(data.orderId, data.restaurantId, 'closed')
        .then((order) => { io.to(String(data.restaurantId)).emit('order:status-changed', order); })
        .catch(() => { socket.emit('error', { message: 'No se pudo cancelar la orden' }); });
    });
  });
}
