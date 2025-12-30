import { McpAgentService } from '@infra/mcp/mcp-agent-service';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternalServerErrorException } from '@shared/exceptions/internal-server-error-exception';
import { ValidationException } from '@shared/exceptions/validation-exception';
import {
  McpChatRequestDTO,
  McpChatResponseDTO,
} from '../dtos/mcp/mcp-chat-dto';

@ApiTags('MCP')
@Controller('mcp')
export class McpController {
  constructor(private readonly mcpAgentService: McpAgentService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process natural language financial request',
    description:
      'Send a natural language message to the MCP agent for expense management. The agent will interpret the intent and execute appropriate actions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully processed the message',
    type: McpChatResponseDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationException,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorException,
  })
  async chat(@Body() body: McpChatRequestDTO): Promise<McpChatResponseDTO> {
    const result = await this.mcpAgentService.chat(
      body.sessionId,
      body.userId,
      body.message,
    );

    return {
      originalResponse: result.toolResults,
      llmResponse: result.response,
    };
  }
}
