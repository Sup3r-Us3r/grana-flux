import { CreateCategoryUseCase } from '@application/use-cases/expenses/create-category/create-category-use-case';
import { CreateExpenseUseCase } from '@application/use-cases/expenses/create-expense/create-expense-use-case';
import { GetExpenseSummaryUseCase } from '@application/use-cases/expenses/get-expense-summary/get-expense-summary-use-case';
import { ListCategoriesUseCase } from '@application/use-cases/expenses/list-categories/list-categories-use-case';
import { ListExpensesUseCase } from '@application/use-cases/expenses/list-expenses/list-expenses-use-case';
import { MessageHistoryProvider } from '@domain/providers/message-history-provider';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createMcpTools } from './tools/mcp-tools';

export interface McpChatResponse {
  toolResults: Record<string, unknown>[];
  response: string;
}

const SYSTEM_PROMPT = `Você é um assistente financeiro pessoal inteligente e preciso chamado GranaFlux.

Suas responsabilidades:
- Ajudar usuários a registrar, consultar e analisar seus gastos pessoais
- Utilizar as tools disponíveis para todas as operações de dados
- Nunca inventar valores, dados ou informações financeiras
- Responder de forma clara, concisa e amigável em português brasileiro
- Nunca expor detalhes técnicos, IDs internos ou estrutura do sistema

FLUXO OBRIGATÓRIO PARA REGISTRAR GASTOS:
1. SEMPRE chame list_categories primeiro para ver as categorias disponíveis
2. Analise as categorias retornadas e encontre a mais adequada para o gasto
3. Se a categoria adequada existir, use o ID dela diretamente
4. Se NÃO existir uma categoria adequada, chame create_category para criar uma nova
5. Com o categoryId em mãos (obtido de list_categories ou create_category), chame create_expense
6. NUNCA peça ao usuário o ID da categoria - resolva automaticamente usando as tools

Quando o usuário mencionar gastos ou despesas:
- Extraia descrição, valor, categoria e data da mensagem
- Se a data não for especificada, use a data atual
- Se a categoria não for clara, infira baseado na descrição
- Valores podem estar em formato brasileiro (ex: "45,90" = 45.90)

Categorias comuns (use como referência para inferir):
- Alimentação: restaurantes, mercado, delivery, lanches
- Transporte: combustível, uber, ônibus, estacionamento, gasolina
- Moradia: aluguel, condomínio, contas de água/luz/gás
- Saúde: farmácia, consultas, exames, plano de saúde
- Lazer: cinema, shows, jogos, viagens
- Educação: cursos, livros, materiais
- Compras: roupas, eletrônicos, presentes
- Outros: tudo que não se encaixa nas anteriores

Ao responder sobre gastos:
- Formate valores em reais (R$)
- Use datas no formato brasileiro (DD/MM/YYYY)
- Seja objetivo mas empático
- Ofereça insights quando apropriado`;

@Injectable()
export class McpAgentService implements OnModuleInit {
  private readonly logger = new Logger(McpAgentService.name);
  private model: ChatGoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly listExpensesUseCase: ListExpensesUseCase,
    private readonly getExpenseSummaryUseCase: GetExpenseSummaryUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly messageHistoryProvider: MessageHistoryProvider,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_API_KEY not configured. MCP Agent will not be available.',
      );
      return;
    }

    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-3-flash-preview',
      apiKey,
      temperature: 0.3,
    });

    this.logger.log('MCP Agent initialized with Gemini 3 Flash');
  }

  async chat(
    sessionId: string,
    userId: string,
    message: string,
  ): Promise<McpChatResponse> {
    if (!this.model) {
      return {
        toolResults: [],
        response:
          'O assistente financeiro não está disponível no momento. Verifique a configuração da API.',
      };
    }

    const tools = createMcpTools(
      userId,
      this.createExpenseUseCase,
      this.listExpensesUseCase,
      this.getExpenseSummaryUseCase,
      this.createCategoryUseCase,
      this.listCategoriesUseCase,
    );

    const modelWithTools = this.model.bindTools(tools);

    // Get conversation history
    const history = await this.messageHistoryProvider.getMessages(sessionId);

    // Build messages array
    const messages: BaseMessage[] = [
      new SystemMessage(SYSTEM_PROMPT),
      ...history.map((msg) =>
        msg.role === 'human'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content),
      ),
      new HumanMessage(message),
    ];

    const toolResults: Record<string, unknown>[] = [];
    let response = '';

    try {
      // Agentic loop: keep processing until no more tool calls
      const currentMessages = [...messages];
      let continueLoop = true;

      while (continueLoop) {
        const aiResponse = await modelWithTools.invoke(currentMessages);

        if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
          const toolResponses: { toolCallId: string; content: string }[] = [];

          for (const toolCall of aiResponse.tool_calls) {
            const tool = tools.find((t) => t.name === toolCall.name);
            if (tool) {
              this.logger.debug(
                `Executing tool: ${toolCall.name} with args: ${JSON.stringify(toolCall.args)}`,
              );
              const result = await (
                tool as { invoke: (args: unknown) => Promise<string> }
              ).invoke(toolCall.args);
              const parsedResult = JSON.parse(result);
              toolResults.push({ tool: toolCall.name, result: parsedResult });
              toolResponses.push({
                toolCallId: toolCall.id ?? '',
                content: result,
              });
            }
          }

          // Add AI response and tool results to messages for next iteration
          currentMessages.push(aiResponse);
          for (const toolResponse of toolResponses) {
            currentMessages.push(
              new ToolMessage({
                tool_call_id: toolResponse.toolCallId,
                content: toolResponse.content,
              }),
            );
          }
        } else {
          // No more tool calls, extract final response
          response =
            typeof aiResponse.content === 'string'
              ? aiResponse.content
              : JSON.stringify(aiResponse.content);
          continueLoop = false;
        }
      }

      // Save to history
      await this.messageHistoryProvider.addMessage(sessionId, {
        role: 'human',
        content: message,
        timestamp: new Date(),
      });

      await this.messageHistoryProvider.addMessage(sessionId, {
        role: 'ai',
        content: response,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`MCP Agent error: ${error}`);
      response =
        'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.';
    }

    return {
      toolResults,
      response,
    };
  }
}
