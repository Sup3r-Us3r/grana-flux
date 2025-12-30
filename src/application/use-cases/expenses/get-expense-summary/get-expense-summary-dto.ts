export interface GetExpenseSummaryInputDTO {
  userId: string;
  startDate?: string;
  endDate?: string;
}

export interface CategorySummaryDTO {
  categoryId: string;
  categoryName: string;
  total: number;
  totalFormatted: string;
  count: number;
  percentage: number;
}

export interface TopExpenseDTO {
  id: string;
  description: string;
  amount: number;
  amountFormatted: string;
  date: Date;
}

export interface GetExpenseSummaryOutputDTO {
  totalAmount: number;
  totalAmountFormatted: string;
  averageAmount: number;
  averageAmountFormatted: string;
  count: number;
  byCategory: CategorySummaryDTO[];
  topExpenses: TopExpenseDTO[];
}
