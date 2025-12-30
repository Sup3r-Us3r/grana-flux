export interface CreateExpenseInputDTO {
  userId: string;
  description: string;
  amount: number;
  category: string;
  date?: string;
}

export interface CreateExpenseOutputDTO {
  id: string;
  description: string;
  amount: number;
  amountFormatted: string;
  category: string;
  date: Date;
  createdAt: Date;
}
