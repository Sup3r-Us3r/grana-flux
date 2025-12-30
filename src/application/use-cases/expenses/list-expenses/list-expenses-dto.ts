export interface ListExpensesInputDTO {
  userId: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseItemDTO {
  id: string;
  description: string;
  amount: number;
  amountFormatted: string;
  category: string;
  date: Date;
  createdAt: Date;
}

export interface ListExpensesOutputDTO {
  expenses: ExpenseItemDTO[];
  total: number;
  totalAmount: number;
  totalAmountFormatted: string;
}
