import { CreateExpenseUseCase } from '@application/use-cases/expenses/create-expense/create-expense-use-case';
import { GetExpenseSummaryUseCase } from '@application/use-cases/expenses/get-expense-summary/get-expense-summary-use-case';
import { ListExpensesUseCase } from '@application/use-cases/expenses/list-expenses/list-expenses-use-case';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export function createMcpTools(
  userId: string,
  createExpenseUseCase: CreateExpenseUseCase,
  listExpensesUseCase: ListExpensesUseCase,
  getExpenseSummaryUseCase: GetExpenseSummaryUseCase,
) {
  const createExpenseTool = new DynamicStructuredTool({
    name: 'create_expense',
    description:
      'Register a new personal expense. Use when user wants to add, register, or record a new expense or spending.',
    schema: z.object({
      description: z.string().describe('Description of the expense'),
      amount: z
        .number()
        .describe(
          'Amount in BRL (Brazilian Reais). Must be a positive number.',
        ),
      category: z
        .string()
        .describe(
          'Category of the expense (e.g., Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Compras, Outros)',
        ),
      date: z
        .string()
        .optional()
        .describe(
          'Date of expense in ISO format (YYYY-MM-DD), defaults to today if not specified',
        ),
    }),
    func: async ({ description, amount, category, date }) => {
      const result = await createExpenseUseCase.execute({
        userId,
        description,
        amount,
        category,
        date,
      });

      return JSON.stringify({
        success: true,
        message: `Gasto registrado com sucesso!`,
        expense: {
          id: result.id,
          description: result.description,
          amount: result.amountFormatted,
          category: result.category,
          date: result.date.toLocaleDateString('pt-BR'),
        },
      });
    },
  });

  const listExpensesTool = new DynamicStructuredTool({
    name: 'list_expenses',
    description:
      'List expenses with optional filters by period, category, or amount range. Use when user wants to see, list, or query their expenses.',
    schema: z.object({
      startDate: z
        .string()
        .optional()
        .describe('Start date filter in ISO format (YYYY-MM-DD)'),
      endDate: z
        .string()
        .optional()
        .describe('End date filter in ISO format (YYYY-MM-DD)'),
      category: z.string().optional().describe('Filter by category name'),
      minAmount: z.number().optional().describe('Minimum amount filter'),
      maxAmount: z.number().optional().describe('Maximum amount filter'),
    }),
    func: async ({ startDate, endDate, category, minAmount, maxAmount }) => {
      const result = await listExpensesUseCase.execute({
        userId,
        startDate,
        endDate,
        category,
        minAmount,
        maxAmount,
      });

      return JSON.stringify({
        success: true,
        total: result.total,
        totalAmount: result.totalAmountFormatted,
        expenses: result.expenses.map((e) => ({
          description: e.description,
          amount: e.amountFormatted,
          category: e.category,
          date: new Date(e.date).toLocaleDateString('pt-BR'),
        })),
      });
    },
  });

  const expenseSummaryTool = new DynamicStructuredTool({
    name: 'expense_summary',
    description:
      'Get financial summary including total spent, average, expenses by category, and top expenses. Use when user asks about totals, averages, summaries, or wants to analyze their spending.',
    schema: z.object({
      startDate: z
        .string()
        .optional()
        .describe('Start date for summary in ISO format (YYYY-MM-DD)'),
      endDate: z
        .string()
        .optional()
        .describe('End date for summary in ISO format (YYYY-MM-DD)'),
    }),
    func: async ({ startDate, endDate }) => {
      const result = await getExpenseSummaryUseCase.execute({
        userId,
        startDate,
        endDate,
      });

      return JSON.stringify({
        success: true,
        summary: {
          totalAmount: result.totalAmountFormatted,
          averageAmount: result.averageAmountFormatted,
          totalExpenses: result.count,
          byCategory: result.byCategory.map((c) => ({
            category: c.categoryName,
            total: c.totalFormatted,
            count: c.count,
            percentage: `${c.percentage}%`,
          })),
          topExpenses: result.topExpenses.map((e) => ({
            description: e.description,
            amount: e.amountFormatted,
            date: new Date(e.date).toLocaleDateString('pt-BR'),
          })),
        },
      });
    },
  });

  return [createExpenseTool, listExpensesTool, expenseSummaryTool];
}
