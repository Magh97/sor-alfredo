import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../reports.repository.js', () => ({
  ReportsRepository: {
    salesByPeriod: vi.fn(),
    topProducts: vi.fn(),
    ordersByUser: vi.fn(),
  },
}));

vi.mock('../../cash/cash.repository.js', () => ({
  CashRepository: {
    findRegisterHistory: vi.fn(),
  },
}));

const { ReportsRepository } = await import('../reports.repository.js');
const { CashRepository } = await import('../../cash/cash.repository.js');
const { ReportsService } = await import('../reports.service.js');

describe('ReportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('salesByPeriod', () => {
    it('should call repository with correct params', async () => {
      vi.mocked(ReportsRepository.salesByPeriod).mockResolvedValue([{ period: new Date(), totalSales: '100' }] as never);

      const result = await ReportsService.salesByPeriod(1, '2026-01-01', '2026-01-31', 'day');

      expect(result).toHaveLength(1);
      expect(ReportsRepository.salesByPeriod).toHaveBeenCalledWith(1, '2026-01-01', '2026-01-31', 'day');
    });

    it('should handle empty results', async () => {
      vi.mocked(ReportsRepository.salesByPeriod).mockResolvedValue([] as never);

      const result = await ReportsService.salesByPeriod(1, '2026-01-01', '2026-01-31', 'month');

      expect(result).toHaveLength(0);
    });
  });

  describe('topProducts', () => {
    it('should pass limit to repository', async () => {
      vi.mocked(ReportsRepository.topProducts).mockResolvedValue([{ productId: 1, productName: 'Test' }] as never);

      await ReportsService.topProducts(1, '2026-01-01', '2026-01-31', 5);

      expect(ReportsRepository.topProducts).toHaveBeenCalledWith(1, '2026-01-01', '2026-01-31', 5);
    });
  });

  describe('ordersByUser', () => {
    it('should return user performance', async () => {
      vi.mocked(ReportsRepository.ordersByUser).mockResolvedValue([
        { userId: 1, userName: 'Mesero', orderCount: 10, totalSales: '500' },
      ] as never);

      const result = await ReportsService.ordersByUser(1, '2026-01-01', '2026-01-31');

      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe('Mesero');
    });
  });

  describe('cashHistory', () => {
    it('should delegate to CashRepository', async () => {
      vi.mocked(CashRepository.findRegisterHistory).mockResolvedValue([{ id: 1 }] as never);

      await ReportsService.cashHistory(1);

      expect(CashRepository.findRegisterHistory).toHaveBeenCalledWith(1);
    });
  });
});
