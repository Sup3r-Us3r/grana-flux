import { UserRepository } from '@domain/users/repositories/user-repository';
import { MemoryUserRepository } from '@infra/database/memory/memory-user-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@shared/exceptions/not-found-exception';
import { createUserEntityFactory } from '@test/factories';
import { UpdateUserUseCase } from './update-user-use-case';

describe('UpdateUserUseCase', () => {
  let sut: UpdateUserUseCase;
  let userRepository: MemoryUserRepository;

  beforeEach(async () => {
    const memoryUserRepository = new MemoryUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: UserRepository,
          useValue: memoryUserRepository,
        },
      ],
    }).compile();

    sut = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = memoryUserRepository;
  });

  it('should be able to update a user name', async () => {
    const user = createUserEntityFactory({ name: 'John Doe' });
    await userRepository.create(user);

    const result = await sut.execute({
      id: user.id,
      name: 'Jane Doe',
    });

    expect(result.id).toBe(user.id);
    expect(result.name).toBe('Jane Doe');
    expect(result.telegramUserId).toBe(user.telegramUserId);

    const updatedUser = await userRepository.findById(user.id);
    expect(updatedUser?.name).toBe('Jane Doe');
  });

  it('should throw error if user does not exist', async () => {
    await expect(
      sut.execute({ id: 'non-existent-id', name: 'Test' }),
    ).rejects.toThrow(NotFoundException);
  });
});
