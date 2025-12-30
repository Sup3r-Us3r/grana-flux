import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class McpChatRequestDTO {
  @ApiProperty({
    description: 'Session ID for conversation history (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Natural language message',
    example: 'Gastei R$ 45,90 no almoço hoje',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  message: string;
}

export class McpChatResponseDTO {
  @ApiProperty({
    description: 'Raw response from executed tools',
    example: [
      {
        tool: 'create_expense',
        result: {
          success: true,
          expense: {
            id: '...',
            description: 'Almoço',
            amount: 'R$ 45,90',
          },
        },
      },
    ],
  })
  originalResponse: Record<string, unknown>[];

  @ApiProperty({
    description: 'LLM generated natural language response',
    example:
      'Pronto! Registrei seu gasto de R$ 45,90 na categoria Alimentação.',
  })
  llmResponse: string;
}
