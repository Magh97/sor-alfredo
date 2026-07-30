import { TablesRepository } from './tables.repository.js';
import { AppError } from '../../shared/errors.js';
import type { CreateTableInput, UpdateTableInput } from './tables.schema.js';

export class TablesService {
  static async list(restaurantId: number) {
    return TablesRepository.findAll(restaurantId);
  }

  static async create(restaurantId: number, input: CreateTableInput) {
    const existing = await TablesRepository.findByNumber(input.number, restaurantId);
    if (existing) throw new AppError('CONFLICT', 'Ya existe una mesa con ese número', 409);
    return TablesRepository.create(restaurantId, input);
  }

  static async update(id: number, restaurantId: number, input: UpdateTableInput) {
    const table = await TablesRepository.findById(id, restaurantId);
    if (!table) throw new AppError('NOT_FOUND', 'Mesa no encontrada', 404);

    if (input.number && input.number !== table.number) {
      const existing = await TablesRepository.findByNumber(input.number, restaurantId);
      if (existing) throw new AppError('CONFLICT', 'Ya existe una mesa con ese número', 409);
    }

    return TablesRepository.update(id, restaurantId, input);
  }

  static async changeStatus(id: number, restaurantId: number, status: 'free' | 'occupied' | 'reserved' | 'cleaning') {
    const table = await TablesRepository.findById(id, restaurantId);
    if (!table) throw new AppError('NOT_FOUND', 'Mesa no encontrada', 404);

    const validTransitions: Record<string, string[]> = {
      free: ['occupied', 'reserved', 'cleaning'],
      occupied: ['free', 'cleaning'],
      reserved: ['free', 'occupied'],
      cleaning: ['free'],
    };

    if (!validTransitions[table.status]?.includes(status)) {
      throw new AppError('CONFLICT', `No se puede cambiar de ${table.status} a ${status}`, 409);
    }

    return TablesRepository.updateStatus(id, status);
  }
}
