import { UserRepository } from '@domain/users/repositories/user-repository';
import { AddressVO } from '@domain/users/value-objects/address-vo';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@shared/exceptions/not-found-exception';
import {
  UpdateUserUseCaseInputDTO,
  UpdateUserUseCaseOutputDTO,
} from './update-user-dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: UpdateUserUseCaseInputDTO,
  ): Promise<UpdateUserUseCaseOutputDTO> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let newAddress = user.address;
    if (
      input?.street ||
      input?.number ||
      input?.city ||
      input?.state ||
      input?.zipCode ||
      input?.complement
    ) {
      newAddress = new AddressVO({
        street: input?.street ?? user.address.street,
        number: input?.number ?? user.address.number,
        city: input?.city ?? user.address.city,
        state: input?.state ?? user.address.state,
        zipCode: input?.zipCode ?? user.address.zipCode,
        complement: input?.complement ?? user.address.complement,
      });
    }

    user.update({ name: input.name, address: newAddress });
    await this.userRepository.update(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      updatedAt: user.updatedAt,
    };
  }
}
