export interface CreateExpenseInputDTO {
  userId: string;
  description: string;
  amount: number;
  categoryId: string;
  date?: string;
}

export interface CreateExpenseOutputDTO {
  id: string;
  description: string;
  amount: number;
  amountFormatted: string;
  categoryId: string;
  categoryName: string;
  date: Date;
  createdAt: Date;
}
