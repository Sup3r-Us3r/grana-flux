import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetUserByIdResponseDTO {
  @ApiProperty({ example: 'uuid-1234-5678', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 123456789, description: 'Telegram user ID' })
  telegramUserId: number;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;

  @ApiPropertyOptional({ example: 'johndoe', description: 'Telegram username' })
  username: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}
