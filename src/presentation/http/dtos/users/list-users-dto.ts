import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListUsersRequestDTO {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
    minimum: 1,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}

export class ListUsersItemDTO {
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
}

export class ListUsersPaginationDTO {
  @ApiProperty({ type: [ListUsersItemDTO], description: 'List of users' })
  items: ListUsersItemDTO[];

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  currentPage: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  perPage: number;

  @ApiProperty({ example: 10, description: 'Last page number' })
  lastPage: number;
}

export class ListUsersResponseDTO {
  @ApiProperty({ type: ListUsersPaginationDTO, description: 'Paginated data' })
  data: ListUsersPaginationDTO;
}
