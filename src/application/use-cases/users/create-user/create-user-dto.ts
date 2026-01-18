export interface CreateUserUseCaseInputDTO {
  telegramUserId: number;
  name: string;
  username?: string;
}

export interface CreateUserUseCaseOutputDTO {
  id: string;
  telegramUserId: number;
  name: string;
  username: string | null;
  createdAt: Date;
}
