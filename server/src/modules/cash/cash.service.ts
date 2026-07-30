import { CashRepository } from './cash.repository.js';
import { OrdersRepository } from '../orders/orders.repository.js';
import { TablesRepository } from '../tables/tables.repository.js';
import { AppError } from '../../shared/errors.js';
import type { OpenRegisterInput, PaymentInput } from './cash.schema.js';

export class CashService {
  static async openRegister(restaurantId: number, userId: number, input: OpenRegisterInput) {
    const active = await CashRepository.findActiveRegister(restaurantId);
    if (active) throw new AppError('CONFLICT', 'Ya hay un turno de caja abierto', 409);

    return CashRepository.openRegister(restaurantId, userId, input);
  }

  static async getCurrentRegister(restaurantId: number) {
    const register = await CashRepository.findActiveRegister(restaurantId);
    if (!register) throw new AppError('NOT_FOUND', 'No hay turno de caja abierto', 404);

    const payments = await CashRepository.findPaymentsByRegister(register.id);
    return { ...register, payments };
  }

  static async closeRegister(restaurantId: number) {
    const register = await CashRepository.findActiveRegister(restaurantId);
    if (!register) throw new AppError('NOT_FOUND', 'No hay turno de caja abierto', 404);

    const payments = await CashRepository.findPaymentsByRegister(register.id);
    const totalSales = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(4);
    const totalTips = payments.reduce((sum, p) => sum + parseFloat(p.tipAmount), 0).toFixed(4);

    const closed = await CashRepository.closeRegister(register.id, { totalSales, totalTips });
    return { ...closed, payments, totalSales, totalTips };
  }

  static async registerPayment(orderId: number, restaurantId: number, userId: number, input: PaymentInput) {
    const register = await CashRepository.findActiveRegister(restaurantId);
    if (!register) throw new AppError('CONFLICT', 'No hay turno de caja abierto. Abra la caja primero.', 409);

    const order = await OrdersRepository.findById(orderId, restaurantId);
    if (!order) throw new AppError('NOT_FOUND', 'Orden no encontrada', 404);
    if (order.status !== 'delivered' && order.status !== 'partially_paid') {
      throw new AppError('CONFLICT', 'La orden debe estar entregada para recibir pago', 409);
    }

    const payment = await CashRepository.createPayment({
      orderId,
      userId,
      cashRegisterId: register.id,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      tipAmount: input.tipAmount,
    });

    if (parseFloat(input.tipAmount) > 0) {
      if (input.tipDistribution === 'equal') {
        const half = (parseFloat(input.tipAmount) / 2).toFixed(4);
        await CashRepository.createTipDistribution({
          paymentId: payment.id, userId: order.userId, amount: half, distributionType: 'equal',
        });
        await CashRepository.createTipDistribution({
          paymentId: payment.id, userId, amount: half, distributionType: 'equal',
        });
      } else {
        await CashRepository.createTipDistribution({
          paymentId: payment.id, userId: order.userId, amount: input.tipAmount, distributionType: 'individual',
        });
      }
    }

    const paidAmount = parseFloat(input.amount);
    const orderTotal = parseFloat(order.totalAmount);
    const newStatus = paidAmount >= orderTotal ? 'paid' : 'partially_paid';

    await OrdersRepository.updateStatus(orderId, restaurantId, newStatus);
    if (newStatus === 'paid') {
      await TablesRepository.updateStatus(order.tableId, 'free');
    }

    return payment;
  }

  static async getRegisterHistory(restaurantId: number) {
    return CashRepository.findRegisterHistory(restaurantId);
  }

  static async getTips(restaurantId: number) {
    return CashRepository.findTips(restaurantId);
  }
}
