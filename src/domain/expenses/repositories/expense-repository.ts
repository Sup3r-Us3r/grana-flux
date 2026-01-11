import { Expense } from '../entities/expense-entity';

export interface ExpenseSummary {
  totalAmount: number;
  averageAmount: number;
  count: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    total: number;
    count: number;
  }[];
  topExpenses: Expense[];
}

export interface ExpenseFilters {
  userId: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export abstract class ExpenseRepository {
  abstract create(expense: Expense): Promise<void>;
  abstract findById(id: string): Promise<Expense | null>;
  abstract findByUserId(userId: string): Promise<Expense[]>;
  abstract findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]>;
  abstract findByUserIdAndCategory(
    userId: string,
    categoryId: string,
  ): Promise<Expense[]>;
  abstract delete(id: string): Promise<void>;
  abstract getSummaryByUserId(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ExpenseSummary>;
  abstract findWithFilters(filters: ExpenseFilters): Promise<Expense[]>;
}
