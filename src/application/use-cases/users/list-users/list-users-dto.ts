import { PaginationType } from '@shared/types/pagination-type';

export interface ListUsersUseCaseInputDTO {
  page?: number;
  limit?: number;
}

export interface ListUsersUseCaseOutputDTO {
  data: PaginationType<{
    id: string;
    telegramUserId: number;
    name: string;
    username: string | null;
    createdAt: Date;
  }>;
}
