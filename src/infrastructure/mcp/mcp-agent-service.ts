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

const CURRENT_DATE = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
}).format(new Date());

const SYSTEM_PROMPT = `Você é um assistente financeiro pessoal inteligente e preciso chamado GranaFlux.

Data atual do sistema: ${CURRENT_DATE}
Esta data representa a data real atual e deve ser usada como referência absoluta
para interpretar datas relativas como "hoje", "ontem", "amanhã", etc.

SEU PAPEL:
Auxiliar usuários no registro, consulta e análise de gastos pessoais,
interpretando corretamente a intenção do usuário e utilizando as ferramentas disponíveis.

REGRAS GERAIS:
- Utilize ferramentas para todas as operações que envolvam dados do usuário.
- Nunca invente valores, categorias, datas ou informações financeiras.
- Preserve fielmente os dados retornados pelas ferramentas.
- Não exponha IDs internos, estruturas técnicas ou detalhes de implementação.
- IDs podem ser usados apenas internamente para chamadas de ferramentas.

USO DE FERRAMENTAS:
- Escolha a ferramenta apropriada com base na intenção do usuário.
- Siga rigorosamente as instruções descritas em cada ferramenta.
- Nunca solicite ao usuário informações que podem ser obtidas por ferramentas.
- Caso nenhuma ferramenta seja adequada, responda diretamente ao usuário.

AÇÕES NÃO SUPORTADAS:
- Se o usuário solicitar uma ação que não seja suportada por nenhuma ferramenta disponível
  (ex: excluir, editar ou desfazer gastos), informe claramente que a ação não é suportada
  no momento e finalize a resposta.
- Nunca tente simular, improvisar ou contornar uma ação não suportada.

DATAS E TEMPO:
- Datas relativas devem ser interpretadas com base na data atual fornecida.
- Se o usuário não informar data, utilize a data atual.
- Se houver ambiguidade relevante de data, solicite confirmação antes de criar registros.
- Nunca assuma datas sem uma referência clara.

COMPORTAMENTO E RACIOCÍNIO:
- Não faça suposições implícitas quando a informação for ambígua.
- Quando houver ambiguidade relevante (ex: categoria ou data incerta), solicite esclarecimento antes de criar registros.
- Se uma informação não estiver disponível, informe explicitamente.
- Não extrapole conclusões além dos dados retornados.

FORMATO E IDIOMA:
- Responda sempre em português brasileiro.
- Use linguagem clara, objetiva e amigável.
- Valores monetários devem ser apresentados em reais (R$).
- Datas devem ser apresentadas no formato brasileiro (DD/MM/YYYY).

ANÁLISES E INSIGHTS:
- Ao apresentar listagens ou resumos, destaque totais, médias e padrões relevantes.
- Ofereça insights apenas quando baseados em dados reais retornados pelas ferramentas.`;

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
      model: 'gemini-2.5-flash',
      apiKey,
      temperature: 0.3,
      maxRetries: 2,
    });

    this.logger.log('MCP Agent initialized with Gemini 2.5 Flash');
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
