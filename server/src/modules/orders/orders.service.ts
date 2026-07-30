import { OrdersRepository } from './orders.repository.js';
import { TablesRepository } from '../tables/tables.repository.js';
import { AppError } from '../../shared/errors.js';
import type { CreateOrderInput, AddItemsInput } from './orders.schema.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['in_kitchen'],
  in_kitchen: ['ready'],
  ready: ['delivered'],
  delivered: ['paid', 'partially_paid'],
  partially_paid: ['paid'],
  paid: ['closed'],
  closed: [],
};

export class OrdersService {
  static async list(restaurantId: number, filters: { status?: string; tableId?: number; userId?: number; page?: number; pageSize?: number }) {
    return OrdersRepository.findAll(restaurantId, filters);
  }

  static async getById(id: number, restaurantId: number) {
    const order = await OrdersRepository.findOrderWithItems(id, restaurantId);
    if (!order) throw new AppError('NOT_FOUND', 'Orden no encontrada', 404);
    return order;
  }

  static async create(restaurantId: number, userId: number, input: CreateOrderInput) {
    const table = await TablesRepository.findById(input.tableId, restaurantId);
    if (!table) throw new AppError('NOT_FOUND', 'Mesa no encontrada', 404);
    if (table.status !== 'free') throw new AppError('CONFLICT', 'La mesa no está libre', 409);

    const order = await OrdersRepository.create(restaurantId, userId, input);
    await TablesRepository.updateStatus(input.tableId, 'occupied');

    return order;
  }

  static async addItems(id: number, restaurantId: number, items: AddItemsInput['items']) {
    const order = await OrdersRepository.findById(id, restaurantId);
    if (!order) throw new AppError('NOT_FOUND', 'Orden no encontrada', 404);
    if (order.status === 'closed' || order.status === 'paid' || order.status === 'partially_paid') {
      throw new AppError('CONFLICT', 'No se pueden agregar items a una orden cerrada o pagada', 409);
    }

    return OrdersRepository.addItems(id, restaurantId, items);
  }

  static async sendToKitchen(id: number, restaurantId: number) {
    const order = await OrdersRepository.findById(id, restaurantId);
    if (!order) throw new AppError('NOT_FOUND', 'Orden no encontrada', 404);
    if (order.status !== 'draft') throw new AppError('CONFLICT', 'Solo órdenes en borrador pueden enviarse a cocina', 409);

    return OrdersRepository.updateStatus(id, restaurantId, 'in_kitchen');
  }

  static async changeStatus(id: number, restaurantId: number, newStatus: string) {
    const order = await OrdersRepository.findById(id, restaurantId);
    if (!order) throw new AppError('NOT_FOUND', 'Orden no encontrada', 404);

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new AppError('CONFLICT', `No se puede cambiar de ${order.status} a ${newStatus}`, 409);
    }

    const updated = await OrdersRepository.updateStatus(id, restaurantId, newStatus as typeof order.status);
    if (!updated) throw new AppError('NOT_FOUND', 'Orden no encontrada', 404);
    return updated;
  }

  static async cancelItem(orderId: number, itemId: number, restaurantId: number) {
    const order = await OrdersRepository.findById(orderId, restaurantId);
    if (!order) throw new AppError('NOT_FOUND', 'Orden no encontrada', 404);
    if (order.status === 'in_kitchen' || order.status === 'ready') {
      throw new AppError('CONFLICT', 'No se pueden cancelar items después de enviar a cocina', 409);
    }

    await OrdersRepository.cancelOrderItem(itemId);
    const totalAmount = await OrdersRepository.recalculateTotal(orderId);
    return { totalAmount };
  }

  static async generateInvoice(id: number, restaurantId: number) {
    return this.getById(id, restaurantId);
  }
}
