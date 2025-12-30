import { ExpenseRepository } from '@domain/expenses/repositories/expense-repository';
import { MoneyVO } from '@domain/expenses/value-objects/money-vo';
import { Injectable } from '@nestjs/common';
import {
  GetExpenseSummaryInputDTO,
  GetExpenseSummaryOutputDTO,
} from './get-expense-summary-dto';

@Injectable()
export class GetExpenseSummaryUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(
    input: GetExpenseSummaryInputDTO,
  ): Promise<GetExpenseSummaryOutputDTO> {
    const startDate = input.startDate ? new Date(input.startDate) : undefined;
    const endDate = input.endDate ? new Date(input.endDate) : undefined;

    const summary = await this.expenseRepository.getSummaryByUserId(
      input.userId,
      startDate,
      endDate,
    );

    const byCategory = summary.byCategory.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      total: cat.total,
      totalFormatted: new MoneyVO(cat.total).formatted,
      count: cat.count,
      percentage:
        summary.totalAmount > 0
          ? Math.round((cat.total / summary.totalAmount) * 100 * 10) / 10
          : 0,
    }));

    const topExpenses = summary.topExpenses.map((expense) => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount.value,
      amountFormatted: expense.amount.formatted,
      date: expense.date,
    }));

    return {
      totalAmount: summary.totalAmount,
      totalAmountFormatted: new MoneyVO(summary.totalAmount).formatted,
      averageAmount: summary.averageAmount,
      averageAmountFormatted: new MoneyVO(summary.averageAmount).formatted,
      count: summary.count,
      byCategory,
      topExpenses,
    };
  }
}
