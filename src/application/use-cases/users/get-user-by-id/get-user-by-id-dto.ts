export interface GetUserByIdUseCaseInputDTO {
  id: string;
}

export interface GetUserByIdUseCaseOutputDTO {
  id: string;
  telegramUserId: number;
  name: string;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
}
