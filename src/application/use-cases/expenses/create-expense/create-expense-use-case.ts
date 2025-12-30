import { Expense } from '@domain/expenses/entities/expense-entity';
import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { ExpenseRepository } from '@domain/expenses/repositories/expense-repository';
import { MoneyVO } from '@domain/expenses/value-objects/money-vo';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@shared/exceptions/not-found-exception';
import {
  CreateExpenseInputDTO,
  CreateExpenseOutputDTO,
} from './create-expense-dto';

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateExpenseInputDTO): Promise<CreateExpenseOutputDTO> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoryRepository.findOrCreate(input.category);

    const amount = new MoneyVO(input.amount);
    const date = input.date ? new Date(input.date) : new Date();

    const expense = new Expense({
      userId: input.userId,
      categoryId: category.id,
      description: input.description,
      amount,
      date,
    });

    await this.expenseRepository.create(expense);

    return {
      id: expense.id,
      description: expense.description,
      amount: expense.amount.value,
      amountFormatted: expense.amount.formatted,
      category: category.name,
      date: expense.date,
      createdAt: expense.createdAt,
    };
  }
}
