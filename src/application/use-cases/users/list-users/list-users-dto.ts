import { PaginationType } from '@shared/types/pagination-type';

export interface ListUsersUseCaseInputDTO {
  page?: number;
  limit?: number;
}

export interface ListUsersUseCaseOutputDTO {
  data: PaginationType<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }>;
}
