import { ReportsRepository } from './reports.repository.js';
import { CashRepository } from '../cash/cash.repository.js';

export class ReportsService {
  static async salesByPeriod(restaurantId: number, from: string, to: string, groupBy: 'day' | 'week' | 'month') {
    return ReportsRepository.salesByPeriod(restaurantId, from, to, groupBy);
  }

  static async topProducts(restaurantId: number, from: string, to: string, limit: number) {
    return ReportsRepository.topProducts(restaurantId, from, to, limit);
  }

  static async ordersByUser(restaurantId: number, from: string, to: string) {
    return ReportsRepository.ordersByUser(restaurantId, from, to);
  }

  static async cashHistory(restaurantId: number) {
    return CashRepository.findRegisterHistory(restaurantId);
  }
}
