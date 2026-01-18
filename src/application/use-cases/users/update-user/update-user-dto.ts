export interface UpdateUserUseCaseInputDTO {
  id: string;
  name?: string;
}

export interface UpdateUserUseCaseOutputDTO {
  id: string;
  telegramUserId: number;
  name: string;
  username: string | null;
  updatedAt: Date;
}
