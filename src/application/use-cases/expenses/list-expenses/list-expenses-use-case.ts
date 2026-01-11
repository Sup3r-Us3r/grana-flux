import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import {
  ExpenseFilters,
  ExpenseRepository,
} from '@domain/expenses/repositories/expense-repository';
import { MoneyVO } from '@domain/expenses/value-objects/money-vo';
import { Injectable } from '@nestjs/common';
import {
  ExpenseItemDTO,
  ListExpensesInputDTO,
  ListExpensesOutputDTO,
} from './list-expenses-dto';

@Injectable()
export class ListExpensesUseCase {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(input: ListExpensesInputDTO): Promise<ListExpensesOutputDTO> {
    const filters = this.buildFilters(input);
    const expenses = await this.expenseRepository.findWithFilters(filters);

    const categories = await this.categoryRepository.findAll();
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const expenseItems: ExpenseItemDTO[] = expenses.map((expense) => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount.value,
      amountFormatted: expense.amount.formatted,
      category: categoryMap.get(expense.categoryId) ?? 'Outros',
      date: expense.date,
      createdAt: expense.createdAt,
    }));

    const totalAmount = expenses.reduce(
      (sum, expense) => sum + expense.amount.value,
      0,
    );

    return {
      expenses: expenseItems,
      total: expenses.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalAmountFormatted: new MoneyVO(totalAmount).formatted,
    };
  }

  private buildFilters(input: ListExpensesInputDTO): ExpenseFilters {
    const filters: ExpenseFilters = {
      userId: input.userId,
    };

    if (input.categoryId) {
      filters.categoryId = input.categoryId;
    }

    if (input.startDate) {
      filters.startDate = new Date(input.startDate);
    }

    if (input.endDate) {
      filters.endDate = new Date(input.endDate);
    }

    if (input.minAmount !== undefined) {
      filters.minAmount = input.minAmount;
    }

    if (input.maxAmount !== undefined) {
      filters.maxAmount = input.maxAmount;
    }

    return filters;
  }
}
