export interface GetUserByTelegramIdUseCaseInputDTO {
  telegramUserId: number;
}

export interface GetUserByTelegramIdUseCaseOutputDTO {
  id: string;
  telegramUserId: number;
  name: string;
  username: string | null;
}
