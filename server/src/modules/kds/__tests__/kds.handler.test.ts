import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerKdsHandlers } from '../kds.handler.js';

vi.mock('../../orders/orders.service.js', () => ({
  OrdersService: {
    changeStatus: vi.fn(),
    getById: vi.fn(),
  },
}));

const { OrdersService } = await import('../../orders/orders.service.js');

describe('KDS Handler', () => {
  let mockIo: { on: ReturnType<typeof vi.fn>; to: ReturnType<typeof vi.fn> };
  let mockSocket: { on: ReturnType<typeof vi.fn>; join: ReturnType<typeof vi.fn>; emit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSocket = {
      on: vi.fn(),
      join: vi.fn(),
      emit: vi.fn(),
    };

    const toEmit = vi.fn();
    mockIo = {
      on: vi.fn((_event: string, cb: (socket: typeof mockSocket) => void) => { cb(mockSocket); }),
      to: vi.fn().mockReturnValue({ emit: toEmit }),
    };
  });

  it('should register connection handler', () => {
    registerKdsHandlers(mockIo as never);

    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('should handle join room on connection', () => {
    registerKdsHandlers(mockIo as never);

    expect(mockSocket.on).toHaveBeenCalledWith('join', expect.any(Function));

    const joinHandler = mockSocket.on.mock.calls.find(([event]: [string]) => event === 'join')?.[1];
    joinHandler('1');

    expect(mockSocket.join).toHaveBeenCalledWith('1');
  });

  it('should handle order:ready via Socket.io', async () => {
    vi.mocked(OrdersService.changeStatus).mockResolvedValue({ id: 1, status: 'ready' } as never);
    vi.mocked(OrdersService.getById).mockResolvedValue({ id: 1, status: 'ready', items: [] } as never);

    registerKdsHandlers(mockIo as never);

    const readyHandler = mockSocket.on.mock.calls.find(([event]: [string]) => event === 'order:ready')?.[1];
    await readyHandler({ orderId: 1, restaurantId: 1 });

    expect(OrdersService.changeStatus).toHaveBeenCalledWith(1, 1, 'ready');
    expect(mockIo.to).toHaveBeenCalledWith('1');
  });

  it('should handle order:cancelled via Socket.io', async () => {
    vi.mocked(OrdersService.changeStatus).mockResolvedValue({ id: 1, status: 'closed' } as never);

    registerKdsHandlers(mockIo as never);

    const cancelHandler = mockSocket.on.mock.calls.find(([event]: [string]) => event === 'order:cancelled')?.[1];
    await cancelHandler({ orderId: 1, restaurantId: 1 });

    expect(OrdersService.changeStatus).toHaveBeenCalledWith(1, 1, 'closed');
  });

  it('should emit error when order:ready fails', async () => {
    vi.mocked(OrdersService.changeStatus).mockRejectedValue(new Error('fail'));

    registerKdsHandlers(mockIo as never);

    const readyHandler = mockSocket.on.mock.calls.find(([event]: [string]) => event === 'order:ready')?.[1];
    await readyHandler({ orderId: 1, restaurantId: 1 });

    expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.objectContaining({ message: expect.any(String) }));
  });
});
