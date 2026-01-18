import { UserRepository } from '@domain/users/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import {
  GetUserByTelegramIdUseCaseInputDTO,
  GetUserByTelegramIdUseCaseOutputDTO,
} from './get-user-by-telegram-id-dto';

@Injectable()
export class GetUserByTelegramIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: GetUserByTelegramIdUseCaseInputDTO,
  ): Promise<GetUserByTelegramIdUseCaseOutputDTO | null> {
    const user = await this.userRepository.findByTelegramUserId(
      input.telegramUserId,
    );

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      telegramUserId: user.telegramUserId,
      name: user.name,
      username: user.username,
    };
  }
}
