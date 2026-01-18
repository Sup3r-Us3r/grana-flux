import { UserRepository } from '@domain/users/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import {
  ListUsersUseCaseInputDTO,
  ListUsersUseCaseOutputDTO,
} from './list-users-dto';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: ListUsersUseCaseInputDTO,
  ): Promise<ListUsersUseCaseOutputDTO> {
    const page = Number(input.page) || 1;
    const limit = Number(input.limit) || 10;
    const result = await this.userRepository.findAll(page, limit);

    return {
      data: {
        ...result,
        items: result.items.map((user) => ({
          id: user.id,
          telegramUserId: user.telegramUserId,
          name: user.name,
          username: user.username,
          createdAt: user.createdAt,
        })),
      },
    };
  }
}
