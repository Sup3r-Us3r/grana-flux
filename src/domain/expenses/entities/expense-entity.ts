import { randomUUID } from 'node:crypto';
import { MoneyVO } from '../value-objects/money-vo';

export interface ExpenseProps {
  id?: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: MoneyVO;
  date: Date;
  createdAt?: Date;
}

export class Expense {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: MoneyVO;
  date: Date;
  createdAt: Date;

  constructor(props: ExpenseProps) {
    this.id = props.id ?? randomUUID();
    this.userId = props.userId;
    this.categoryId = props.categoryId;
    this.description = props.description;
    this.amount = props.amount;
    this.date = props.date;
    this.createdAt = props.createdAt ?? new Date();
  }
}
