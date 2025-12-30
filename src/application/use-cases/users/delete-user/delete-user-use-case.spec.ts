import { UserRepository } from '@domain/users/repositories/user-repository';
import { MemoryUserRepository } from '@infra/database/memory/memory-user-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@shared/exceptions/not-found-exception';
import { createUserEntityFactory } from '@test/factories';
import { DeleteUserUseCase } from './delete-user-use-case';

describe('DeleteUserUseCase', () => {
  let sut: DeleteUserUseCase;
  let userRepository: MemoryUserRepository;

  beforeEach(async () => {
    const memoryUserRepository = new MemoryUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: UserRepository,
          useValue: memoryUserRepository,
        },
      ],
    }).compile();

    sut = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = memoryUserRepository;
  });

  it('should be able to delete a user', async () => {
    const user = createUserEntityFactory();
    await userRepository.create(user);

    await sut.execute({ id: user.id });

    const deletedUser = await userRepository.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  it('should throw error if user does not exist', async () => {
    await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
