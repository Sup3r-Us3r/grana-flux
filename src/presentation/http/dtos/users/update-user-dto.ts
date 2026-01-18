import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserRequestDTO {
  @ApiPropertyOptional({ example: 'John Doe Jr.' })
  @IsString()
  @IsOptional()
  name?: string;
}

export class UpdateUserResponseDTO {
  @ApiProperty({ example: 'uuid-1234-5678' })
  id: string;

  @ApiProperty({ example: 123456789 })
  telegramUserId: number;

  @ApiProperty({ example: 'John Doe Jr.' })
  name: string;

  @ApiPropertyOptional({ example: 'johndoe' })
  username: string | null;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: Date;
}
