import { CreateCategoryUseCase } from '@application/use-cases/expenses/create-category/create-category-use-case';
import { CreateExpenseUseCase } from '@application/use-cases/expenses/create-expense/create-expense-use-case';
import { GetExpenseSummaryUseCase } from '@application/use-cases/expenses/get-expense-summary/get-expense-summary-use-case';
import { ListCategoriesUseCase } from '@application/use-cases/expenses/list-categories/list-categories-use-case';
import { ListExpensesUseCase } from '@application/use-cases/expenses/list-expenses/list-expenses-use-case';
import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { ExpenseRepository } from '@domain/expenses/repositories/expense-repository';
import { CacheProvider } from '@domain/providers/cache-provider';
import { MessageHistoryProvider } from '@domain/providers/message-history-provider';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { PrismaService } from '@infra/database/prisma/prisma-service';
import { PrismaCategoryRepository } from '@infra/database/repositories/prisma-category-repository';
import { PrismaExpenseRepository } from '@infra/database/repositories/prisma-expense-repository';
import { PrismaUserRepository } from '@infra/database/repositories/prisma-user-repository';
import { McpAgentService } from '@infra/mcp/mcp-agent-service';
import { LangchainMessageHistoryProvider } from '@infra/providers/langchain-message-history-provider';
import { RedisCacheProvider } from '@infra/providers/redis-cache-provider';
import { forwardRef, Module } from '@nestjs/common';
import { McpController } from '../http/controllers/mcp-controller';
import { AppModule } from './app-module';

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [McpController],
  providers: [
    PrismaService,
    // Use Cases
    CreateExpenseUseCase,
    ListExpensesUseCase,
    GetExpenseSummaryUseCase,
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    // MCP
    McpAgentService,
    RedisCacheProvider,
    LangchainMessageHistoryProvider,
    // Repository Mappings
    {
      provide: ExpenseRepository,
      useClass: PrismaExpenseRepository,
    },
    {
      provide: CategoryRepository,
      useClass: PrismaCategoryRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: CacheProvider,
      useExisting: RedisCacheProvider,
    },
    {
      provide: MessageHistoryProvider,
      useExisting: LangchainMessageHistoryProvider,
    },
  ],
})
export class McpModule {}
