import { UserRepository } from '@domain/users/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@shared/exceptions/not-found-exception';
import {
  GetUserByIdUseCaseInputDTO,
  GetUserByIdUseCaseOutputDTO,
} from './get-user-by-id-dto';

@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: GetUserByIdUseCaseInputDTO,
  ): Promise<GetUserByIdUseCaseOutputDTO> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      telegramUserId: user.telegramUserId,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
