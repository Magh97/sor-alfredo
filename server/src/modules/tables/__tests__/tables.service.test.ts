import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../tables.repository.js', () => ({
  TablesRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByNumber: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

const { TablesRepository } = await import('../tables.repository.js');
const { TablesService } = await import('../tables.service.js');

describe('TablesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return all tables for restaurant', async () => {
      const mockTables = [{ id: 1, number: 1, status: 'free' }];
      vi.mocked(TablesRepository.findAll).mockResolvedValue(mockTables as never);

      const result = await TablesService.list(1);

      expect(result).toEqual(mockTables);
      expect(TablesRepository.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create table when number is unique', async () => {
      vi.mocked(TablesRepository.findByNumber).mockResolvedValue(null);
      vi.mocked(TablesRepository.create).mockResolvedValue({ id: 1, number: 5 } as never);

      const result = await TablesService.create(1, { number: 5, capacity: 4, positionX: 0, positionY: 0 });

      expect(result).toBeDefined();
      expect(TablesRepository.create).toHaveBeenCalledWith(1, { number: 5, capacity: 4, positionX: 0, positionY: 0 });
    });

    it('should throw CONFLICT when number already exists', async () => {
      vi.mocked(TablesRepository.findByNumber).mockResolvedValue({ id: 1 } as never);

      await expect(TablesService.create(1, { number: 1, capacity: 4, positionX: 0, positionY: 0 }))
        .rejects.toThrow('Ya existe una mesa con ese número');
    });
  });

  describe('update', () => {
    it('should update table', async () => {
      vi.mocked(TablesRepository.findById).mockResolvedValue({ id: 1, number: 1 } as never);
      vi.mocked(TablesRepository.findByNumber).mockResolvedValue(null);
      vi.mocked(TablesRepository.update).mockResolvedValue({ id: 1, number: 2 } as never);

      const result = await TablesService.update(1, 1, { number: 2 });

      expect(result).toBeDefined();
      expect(TablesRepository.update).toHaveBeenCalledWith(1, 1, { number: 2 });
    });

    it('should throw NOT_FOUND when table does not exist', async () => {
      vi.mocked(TablesRepository.findById).mockResolvedValue(null);

      await expect(TablesService.update(999, 1, { capacity: 6 }))
        .rejects.toThrow('Mesa no encontrada');
    });
  });

  describe('changeStatus', () => {
    it('should change status with valid transition', async () => {
      vi.mocked(TablesRepository.findById).mockResolvedValue({ id: 1, status: 'free' } as never);
      vi.mocked(TablesRepository.updateStatus).mockResolvedValue({ id: 1, status: 'occupied' } as never);

      const result = await TablesService.changeStatus(1, 1, 'occupied');

      expect(result).toBeDefined();
      expect(TablesRepository.updateStatus).toHaveBeenCalledWith(1, 'occupied');
    });

    it('should throw CONFLICT on invalid transition', async () => {
      vi.mocked(TablesRepository.findById).mockResolvedValue({ id: 1, status: 'occupied' } as never);

      await expect(TablesService.changeStatus(1, 1, 'reserved'))
        .rejects.toThrow('No se puede cambiar de occupied a reserved');
    });
  });
});
