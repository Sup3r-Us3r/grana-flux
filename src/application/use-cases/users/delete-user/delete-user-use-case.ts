import { UserRepository } from '@domain/users/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@shared/exceptions/not-found-exception';
import { DeleteUserUseCaseInputDTO } from './delete-user-dto';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeleteUserUseCaseInputDTO): Promise<void> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(input.id);
  }
}
