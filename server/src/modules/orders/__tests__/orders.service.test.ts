import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../orders.repository.js', () => ({
  OrdersRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findOrderWithItems: vi.fn(),
    create: vi.fn(),
    addItems: vi.fn(),
    updateStatus: vi.fn(),
    cancelOrderItem: vi.fn(),
    recalculateTotal: vi.fn(),
  },
}));

vi.mock('../../tables/tables.repository.js', () => ({
  TablesRepository: {
    findById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

const { OrdersRepository } = await import('../orders.repository.js');
const { TablesRepository } = await import('../../tables/tables.repository.js');
const { OrdersService } = await import('../orders.service.js');

describe('OrdersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create order when table is free', async () => {
      vi.mocked(TablesRepository.findById).mockResolvedValue({ id: 1, status: 'free' } as never);
      vi.mocked(OrdersRepository.create).mockResolvedValue({ id: 1, status: 'draft' } as never);

      const result = await OrdersService.create(1, 1, {
        tableId: 1,
        items: [{ productId: 1, quantity: 1, modifierIds: [] }],
      });

      expect(result).toBeDefined();
      expect(TablesRepository.updateStatus).toHaveBeenCalledWith(1, 'occupied');
    });

    it('should throw CONFLICT when table is not free', async () => {
      vi.mocked(TablesRepository.findById).mockResolvedValue({ id: 1, status: 'occupied' } as never);

      await expect(OrdersService.create(1, 1, {
        tableId: 1,
        items: [{ productId: 1, quantity: 1, modifierIds: [] }],
      })).rejects.toThrow('La mesa no está libre');
    });

    it('should throw NOT_FOUND when table does not exist', async () => {
      vi.mocked(TablesRepository.findById).mockResolvedValue(null);

      await expect(OrdersService.create(1, 1, {
        tableId: 999,
        items: [{ productId: 1, quantity: 1, modifierIds: [] }],
      })).rejects.toThrow('Mesa no encontrada');
    });
  });

  describe('sendToKitchen', () => {
    it('should send draft order to kitchen', async () => {
      vi.mocked(OrdersRepository.findById).mockResolvedValue({ id: 1, status: 'draft' } as never);
      vi.mocked(OrdersRepository.updateStatus).mockResolvedValue({ id: 1, status: 'in_kitchen' } as never);

      const result = await OrdersService.sendToKitchen(1, 1);

      expect(result.status).toBe('in_kitchen');
      expect(OrdersRepository.updateStatus).toHaveBeenCalledWith(1, 1, 'in_kitchen');
    });

    it('should throw CONFLICT when order is not draft', async () => {
      vi.mocked(OrdersRepository.findById).mockResolvedValue({ id: 1, status: 'in_kitchen' } as never);

      await expect(OrdersService.sendToKitchen(1, 1))
        .rejects.toThrow('Solo órdenes en borrador pueden enviarse a cocina');
    });
  });

  describe('changeStatus', () => {
    it('should allow valid transitions', async () => {
      vi.mocked(OrdersRepository.findById).mockResolvedValue({ id: 1, status: 'in_kitchen' } as never);
      vi.mocked(OrdersRepository.updateStatus).mockResolvedValue({ id: 1, status: 'ready' } as never);

      const result = await OrdersService.changeStatus(1, 1, 'ready');

      expect(result.status).toBe('ready');
    });

    it('should throw CONFLICT on invalid transition', async () => {
      vi.mocked(OrdersRepository.findById).mockResolvedValue({ id: 1, status: 'draft' } as never);

      await expect(OrdersService.changeStatus(1, 1, 'ready'))
        .rejects.toThrow('No se puede cambiar de draft a ready');
    });
  });

  describe('cancelItem', () => {
    it('should cancel item on draft order', async () => {
      vi.mocked(OrdersRepository.findById).mockResolvedValue({ id: 1, status: 'draft' } as never);
      vi.mocked(OrdersRepository.recalculateTotal).mockResolvedValue('50.0000');

      const result = await OrdersService.cancelItem(1, 10, 1);

      expect(result.totalAmount).toBe('50.0000');
      expect(OrdersRepository.cancelOrderItem).toHaveBeenCalledWith(10);
    });

    it('should throw CONFLICT if order already in kitchen', async () => {
      vi.mocked(OrdersRepository.findById).mockResolvedValue({ id: 1, status: 'in_kitchen' } as never);

      await expect(OrdersService.cancelItem(1, 10, 1))
        .rejects.toThrow('No se pueden cancelar items después de enviar a cocina');
    });
  });

  describe('getById', () => {
    it('should return order with items', async () => {
      vi.mocked(OrdersRepository.findOrderWithItems).mockResolvedValue({ id: 1, items: [] } as never);

      const result = await OrdersService.getById(1, 1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NOT_FOUND', async () => {
      vi.mocked(OrdersRepository.findOrderWithItems).mockResolvedValue(null);

      await expect(OrdersService.getById(999, 1)).rejects.toThrow('Orden no encontrada');
    });
  });
});
