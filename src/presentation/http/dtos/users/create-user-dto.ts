import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserRequestDTO {
  @ApiProperty({ example: 123456789, description: 'Telegram user ID' })
  @IsNumber()
  @IsNotEmpty()
  telegramUserId: number;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'johndoe', description: 'Telegram username' })
  @IsString()
  @IsOptional()
  username?: string;
}

export class CreateUserResponseDTO {
  @ApiProperty({ example: 'uuid-1234-5678' })
  id: string;

  @ApiProperty({ example: 123456789 })
  telegramUserId: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({ example: 'johndoe' })
  username: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;
}
