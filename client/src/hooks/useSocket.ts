import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

export function useSocket(restaurantId: number | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    const socket = io({ transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', String(restaurantId));
    });

    socket.on('order:new', () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    socket.on('order:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    socket.on('order:status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, queryClient]);

  return socketRef;
}
