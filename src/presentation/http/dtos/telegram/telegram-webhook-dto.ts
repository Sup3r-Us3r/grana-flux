import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TelegramUserDTO {
  @ApiProperty({
    description: 'Unique identifier for this user',
    example: 123456789,
  })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ description: 'User first name', example: 'John' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ description: 'User last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ description: 'User username', example: 'johndoe' })
  @IsOptional()
  @IsString()
  username?: string;
}

export class TelegramChatDTO {
  @ApiProperty({
    description: 'Unique identifier for this chat',
    example: 123456789,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Type of chat',
    example: 'private',
    enum: ['private', 'group', 'supergroup', 'channel'],
  })
  @IsString()
  type: string;
}

export class TelegramMessageDTO {
  @ApiProperty({ description: 'Unique message identifier', example: 1 })
  @IsNumber()
  message_id: number;

  @ApiProperty({
    description: 'Chat the message belongs to',
    type: TelegramChatDTO,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => TelegramChatDTO)
  chat: TelegramChatDTO;

  @ApiPropertyOptional({
    description: 'Sender of the message',
    type: TelegramUserDTO,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TelegramUserDTO)
  from?: TelegramUserDTO;

  @ApiPropertyOptional({
    description: 'Text of the message',
    example: 'Gastei R$ 50 no almoço',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Date the message was sent (Unix timestamp)',
    example: 1609459200,
  })
  @IsOptional()
  @IsNumber()
  date?: number;
}

export class TelegramWebhookDTO {
  @ApiProperty({
    description: 'Unique update identifier',
    example: 123456789,
  })
  @IsNumber()
  update_id: number;

  @ApiPropertyOptional({
    description: 'New incoming message',
    type: TelegramMessageDTO,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TelegramMessageDTO)
  message?: TelegramMessageDTO;
}
