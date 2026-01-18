import { User } from '@domain/users/entities/user-entity';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { Injectable, Logger } from '@nestjs/common';
import { ValidationException } from '@shared/exceptions/validation-exception';
import {
  CreateUserUseCaseInputDTO,
  CreateUserUseCaseOutputDTO,
} from './create-user-dto';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: CreateUserUseCaseInputDTO,
  ): Promise<CreateUserUseCaseOutputDTO> {
    const existingUser = await this.userRepository.findByTelegramUserId(
      input.telegramUserId,
    );
    if (existingUser) {
      throw new ValidationException(
        'User with this Telegram ID already exists',
      );
    }

    const user = new User({
      telegramUserId: input.telegramUserId,
      name: input.name,
      username: input.username,
    });

    await this.userRepository.create(user);

    this.logger.log(
      `User created: ${user.id} (Telegram ID: ${user.telegramUserId})`,
    );

    return {
      id: user.id,
      telegramUserId: user.telegramUserId,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
