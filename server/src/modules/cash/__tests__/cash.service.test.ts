import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../cash.repository.js', () => ({
  CashRepository: {
    findActiveRegister: vi.fn(),
    openRegister: vi.fn(),
    closeRegister: vi.fn(),
    findRegisterHistory: vi.fn(),
    createPayment: vi.fn(),
    createTipDistribution: vi.fn(),
    findPaymentsByRegister: vi.fn(),
    findTips: vi.fn(),
  },
}));

vi.mock('../../orders/orders.repository.js', () => ({
  OrdersRepository: {
    findById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock('../../tables/tables.repository.js', () => ({
  TablesRepository: {
    updateStatus: vi.fn(),
  },
}));

const { CashRepository } = await import('../cash.repository.js');
const { OrdersRepository } = await import('../../orders/orders.repository.js');
const { TablesRepository } = await import('../../tables/tables.repository.js');
const { CashService } = await import('../cash.service.js');

describe('CashService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openRegister', () => {
    it('should open register when none active', async () => {
      vi.mocked(CashRepository.findActiveRegister).mockResolvedValue(null);
      vi.mocked(CashRepository.openRegister).mockResolvedValue({ id: 1, status: 'open' } as never);

      const result = await CashService.openRegister(1, 3, { initialAmount: '500' });

      expect(result).toBeDefined();
      expect(CashRepository.openRegister).toHaveBeenCalledWith(1, 3, { initialAmount: '500' });
    });

    it('should throw CONFLICT when register already open', async () => {
      vi.mocked(CashRepository.findActiveRegister).mockResolvedValue({ id: 1 } as never);

      await expect(CashService.openRegister(1, 3, { initialAmount: '500' }))
        .rejects.toThrow('Ya hay un turno de caja abierto');
    });
  });

  describe('registerPayment', () => {
    it('should register payment for delivered order', async () => {
      vi.mocked(CashRepository.findActiveRegister).mockResolvedValue({ id: 1 } as never);
      vi.mocked(OrdersRepository.findById).mockResolvedValue({ id: 1, status: 'delivered', totalAmount: '100', userId: 2, tableId: 1 } as never);
      vi.mocked(CashRepository.createPayment).mockResolvedValue({ id: 1, amount: '100' } as never);

      const result = await CashService.registerPayment(1, 1, 3, {
        amount: '100', paymentMethod: 'cash', tipAmount: '0', tipDistribution: 'equal',
      });

      expect(result).toBeDefined();
      expect(OrdersRepository.updateStatus).toHaveBeenCalledWith(1, 1, 'paid');
      expect(TablesRepository.updateStatus).toHaveBeenCalledWith(1, 'free');
    });

    it('should throw CONFLICT when no active register', async () => {
      vi.mocked(CashRepository.findActiveRegister).mockResolvedValue(null);

      await expect(CashService.registerPayment(1, 1, 3, {
        amount: '100', paymentMethod: 'cash', tipAmount: '0', tipDistribution: 'equal',
      })).rejects.toThrow('No hay turno de caja abierto');
    });

    it('should throw when order not delivered', async () => {
      vi.mocked(CashRepository.findActiveRegister).mockResolvedValue({ id: 1 } as never);
      vi.mocked(OrdersRepository.findById).mockResolvedValue({ id: 1, status: 'draft', totalAmount: '100' } as never);

      await expect(CashService.registerPayment(1, 1, 3, {
        amount: '100', paymentMethod: 'cash', tipAmount: '0', tipDistribution: 'equal',
      })).rejects.toThrow('La orden debe estar entregada');
    });
  });

  describe('closeRegister', () => {
    it('should close register with totals', async () => {
      vi.mocked(CashRepository.findActiveRegister).mockResolvedValue({ id: 1 } as never);
      vi.mocked(CashRepository.findPaymentsByRegister).mockResolvedValue([
        { amount: '100', tipAmount: '10' }, { amount: '50', tipAmount: '5' },
      ] as never);
      vi.mocked(CashRepository.closeRegister).mockResolvedValue({ id: 1, status: 'closed' } as never);

      const result = await CashService.closeRegister(1);

      expect(result.totalSales).toBe('150.0000');
      expect(result.totalTips).toBe('15.0000');
    });
  });
});
