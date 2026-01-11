import { Expense } from '@domain/expenses/entities/expense-entity';
import {
  ExpenseFilters,
  ExpenseRepository,
  ExpenseSummary,
} from '@domain/expenses/repositories/expense-repository';
import { MoneyVO } from '@domain/expenses/value-objects/money-vo';
import { PrismaService } from '@infra/database/prisma/prisma-service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaExpenseRepository implements ExpenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(expense: Expense): Promise<void> {
    await this.prisma.expense.create({
      data: {
        id: expense.id,
        userId: expense.userId,
        categoryId: expense.categoryId,
        description: expense.description,
        amount: expense.amount.value,
        date: expense.date,
        createdAt: expense.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) return null;

    return this.toDomain(expense);
  }

  async findByUserId(userId: string): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async findByUserIdAndCategory(
    userId: string,
    categoryId: string,
  ): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { userId, categoryId },
      orderBy: { date: 'desc' },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expense.delete({
      where: { id },
    });
  }

  async findWithFilters(filters: ExpenseFilters): Promise<Expense[]> {
    const where: {
      userId: string;
      categoryId?: string;
      date?: { gte?: Date; lte?: Date };
      amount?: { gte?: number; lte?: number };
    } = {
      userId: filters.userId,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) {
        where.amount.gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        where.amount.lte = filters.maxAmount;
      }
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async getSummaryByUserId(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ExpenseSummary> {
    const dateFilter =
      startDate && endDate
        ? {
            date: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {};

    const expenses = await this.prisma.expense.findMany({
      where: { userId, ...dateFilter },
      include: { category: true },
      orderBy: { amount: 'desc' },
    });

    const totalAmount = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0,
    );
    const count = expenses.length;
    const averageAmount = count > 0 ? totalAmount / count : 0;

    const categoryMap = new Map<
      string,
      { categoryId: string; categoryName: string; total: number; count: number }
    >();

    for (const expense of expenses) {
      const existing = categoryMap.get(expense.categoryId);
      if (existing) {
        existing.total += Number(expense.amount);
        existing.count += 1;
      } else {
        categoryMap.set(expense.categoryId, {
          categoryId: expense.categoryId,
          categoryName: expense.category.name,
          total: Number(expense.amount),
          count: 1,
        });
      }
    }

    const byCategory = Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total,
    );

    const topExpenses = expenses
      .slice(0, 5)
      .map((expense) => this.toDomain(expense));

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageAmount: Math.round(averageAmount * 100) / 100,
      count,
      byCategory,
      topExpenses,
    };
  }

  private toDomain(expense: {
    id: string;
    userId: string;
    categoryId: string;
    description: string;
    amount: unknown;
    date: Date;
    createdAt: Date;
  }): Expense {
    return new Expense({
      id: expense.id,
      userId: expense.userId,
      categoryId: expense.categoryId,
      description: expense.description,
      amount: new MoneyVO(Number(expense.amount)),
      date: expense.date,
      createdAt: expense.createdAt,
    });
  }
}
