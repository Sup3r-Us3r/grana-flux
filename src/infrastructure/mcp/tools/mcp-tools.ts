import { CreateCategoryUseCase } from '@application/use-cases/expenses/create-category/create-category-use-case';
import { CreateExpenseUseCase } from '@application/use-cases/expenses/create-expense/create-expense-use-case';
import { GetExpenseSummaryUseCase } from '@application/use-cases/expenses/get-expense-summary/get-expense-summary-use-case';
import { ListCategoriesUseCase } from '@application/use-cases/expenses/list-categories/list-categories-use-case';
import { ListExpensesUseCase } from '@application/use-cases/expenses/list-expenses/list-expenses-use-case';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export function createMcpTools(
  userId: string,
  createExpenseUseCase: CreateExpenseUseCase,
  listExpensesUseCase: ListExpensesUseCase,
  getExpenseSummaryUseCase: GetExpenseSummaryUseCase,
  createCategoryUseCase: CreateCategoryUseCase,
  listCategoriesUseCase: ListCategoriesUseCase,
) {
  const listCategoriesTool = new DynamicStructuredTool({
    name: 'list_categories',
    description:
      'List all available expense categories. Use this BEFORE creating an expense to get the correct categoryId. Returns category IDs and names.',
    schema: z.object({}),
    func: async () => {
      const result = await listCategoriesUseCase.execute();

      return JSON.stringify({
        success: true,
        categories: result.categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
        })),
        total: result.total,
      });
    },
  });

  const createCategoryTool = new DynamicStructuredTool({
    name: 'create_category',
    description:
      'Create a new expense category. Use when the needed category does not exist in list_categories results.',
    schema: z.object({
      name: z
        .string()
        .describe(
          'Name of the category (e.g., Alimentação, Transporte, Moradia)',
        ),
      color: z
        .string()
        .optional()
        .describe('Hex color code for the category (e.g., #6366f1), optional'),
    }),
    func: async ({ name, color }) => {
      const result = await createCategoryUseCase.execute({ name, color });

      return JSON.stringify({
        success: true,
        message: `Categoria "${result.name}" criada com sucesso!`,
        category: {
          id: result.id,
          name: result.name,
          color: result.color,
        },
      });
    },
  });

  const createExpenseTool = new DynamicStructuredTool({
    name: 'create_expense',
    description:
      'Register a new personal expense. IMPORTANT: Before calling this, you MUST call list_categories to get the categoryId. If the category does not exist, call create_category first.',
    schema: z.object({
      description: z.string().describe('Description of the expense'),
      amount: z
        .number()
        .describe(
          'Amount in BRL (Brazilian Reais). Must be a positive number.',
        ),
      categoryId: z
        .string()
        .describe(
          'ID (UUID) of the category. Get this from list_categories or create_category.',
        ),
      date: z
        .string()
        .optional()
        .describe(
          'Date of expense in ISO format (YYYY-MM-DD), defaults to today if not specified',
        ),
    }),
    func: async ({ description, amount, categoryId, date }) => {
      const result = await createExpenseUseCase.execute({
        userId,
        description,
        amount,
        categoryId,
        date,
      });

      return JSON.stringify({
        success: true,
        message: `Gasto registrado com sucesso!`,
        expense: {
          id: result.id,
          description: result.description,
          amount: result.amountFormatted,
          category: result.categoryName,
          date: result.date.toLocaleDateString('pt-BR'),
        },
      });
    },
  });

  const listExpensesTool = new DynamicStructuredTool({
    name: 'list_expenses',
    description:
      'List expenses with optional filters by period, category, or amount range. Use when user wants to see, list, or query their expenses. For category filter, use the categoryId from list_categories.',
    schema: z.object({
      startDate: z
        .string()
        .optional()
        .describe('Start date filter in ISO format (YYYY-MM-DD)'),
      endDate: z
        .string()
        .optional()
        .describe('End date filter in ISO format (YYYY-MM-DD)'),
      categoryId: z
        .string()
        .optional()
        .describe(
          'Filter by category ID (UUID). Get this from list_categories.',
        ),
      minAmount: z.number().optional().describe('Minimum amount filter'),
      maxAmount: z.number().optional().describe('Maximum amount filter'),
    }),
    func: async ({ startDate, endDate, categoryId, minAmount, maxAmount }) => {
      const result = await listExpensesUseCase.execute({
        userId,
        startDate,
        endDate,
        categoryId,
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

  return [
    listCategoriesTool,
    createCategoryTool,
    createExpenseTool,
    listExpensesTool,
    expenseSummaryTool,
  ];
}
