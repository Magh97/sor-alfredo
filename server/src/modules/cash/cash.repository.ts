import { eq, and, desc } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import type { OpenRegisterInput, PaymentInput } from './cash.schema.js';

export class CashRepository {
  static async findActiveRegister(restaurantId: number) {
    return db.query.cashRegisters.findFirst({
      where: and(
        eq(schema.cashRegisters.restaurantId, restaurantId),
        eq(schema.cashRegisters.status, 'open'),
      ),
    });
  }

  static async openRegister(restaurantId: number, userId: number, input: OpenRegisterInput) {
    const [register] = await db.insert(schema.cashRegisters)
      .values({ restaurantId, userId, initialAmount: input.initialAmount, status: 'open' })
      .returning();
    return register;
  }

  static async closeRegister(id: number, totals: { totalSales: string; totalTips: string }) {
    const [register] = await db.update(schema.cashRegisters)
      .set({ status: 'closed', closedAt: new Date(), totalSales: totals.totalSales, totalTips: totals.totalTips })
      .where(eq(schema.cashRegisters.id, id))
      .returning();
    return register ?? null;
  }

  static async findRegisterHistory(restaurantId: number) {
    return db.select()
      .from(schema.cashRegisters)
      .where(eq(schema.cashRegisters.restaurantId, restaurantId))
      .orderBy(desc(schema.cashRegisters.openedAt));
  }

  static async createPayment(data: {
    orderId: number;
    userId: number;
    cashRegisterId: number;
    amount: string;
    paymentMethod: string;
    tipAmount: string;
  }) {
    const [payment] = await db.insert(schema.payments)
      .values({
        orderId: data.orderId,
        userId: data.userId,
        cashRegisterId: data.cashRegisterId,
        amount: data.amount,
        paymentMethod: data.paymentMethod as 'cash' | 'card' | 'transfer',
        tipAmount: data.tipAmount,
      })
      .returning();
    return payment;
  }

  static async createTipDistribution(data: {
    paymentId: number;
    userId: number;
    amount: string;
    distributionType: string;
  }) {
    const [tip] = await db.insert(schema.tipDistributions)
      .values({
        paymentId: data.paymentId,
        userId: data.userId,
        amount: data.amount,
        distributionType: data.distributionType as 'equal' | 'individual',
      })
      .returning();
    return tip;
  }

  static async findPaymentsByRegister(registerId: number) {
    return db.select()
      .from(schema.payments)
      .where(eq(schema.payments.cashRegisterId, registerId));
  }

  static async findTips(restaurantId: number) {
    return db.select({
      userId: schema.tipDistributions.userId,
      userName: schema.users.name,
      total: schema.tipDistributions.amount,
      distributionType: schema.tipDistributions.distributionType,
    })
      .from(schema.tipDistributions)
      .innerJoin(schema.payments, eq(schema.tipDistributions.paymentId, schema.payments.id))
      .innerJoin(schema.users, eq(schema.tipDistributions.userId, schema.users.id))
      .innerJoin(schema.cashRegisters, eq(schema.payments.cashRegisterId, schema.cashRegisters.id))
      .where(eq(schema.cashRegisters.restaurantId, restaurantId));
  }
}
