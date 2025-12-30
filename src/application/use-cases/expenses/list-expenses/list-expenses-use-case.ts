import { Expense } from '@domain/expenses/entities/expense-entity';
import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { ExpenseRepository } from '@domain/expenses/repositories/expense-repository';
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
    let expenses: Expense[];

    if (input.startDate && input.endDate) {
      expenses = await this.expenseRepository.findByUserIdAndDateRange(
        input.userId,
        new Date(input.startDate),
        new Date(input.endDate),
      );
    } else if (input.category) {
      const category = await this.categoryRepository.findByName(input.category);
      if (category) {
        expenses = await this.expenseRepository.findByUserIdAndCategory(
          input.userId,
          category.id,
        );
      } else {
        expenses = [];
      }
    } else {
      expenses = await this.expenseRepository.findByUserId(input.userId);
    }

    // Apply amount filters
    if (input.minAmount !== undefined || input.maxAmount !== undefined) {
      expenses = expenses.filter((expense) => {
        const amount = expense.amount.value;
        if (input.minAmount !== undefined && amount < input.minAmount)
          return false;
        if (input.maxAmount !== undefined && amount > input.maxAmount)
          return false;
        return true;
      });
    }

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
}
