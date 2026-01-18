import { UserRepository } from '@domain/users/repositories/user-repository';
import { MemoryUserRepository } from '@infra/database/memory/memory-user-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@shared/exceptions/not-found-exception';
import { createUserEntityFactory } from '@test/factories';
import { GetUserByIdUseCase } from './get-user-by-id-use-case';

describe('GetUserByIdUseCase', () => {
  let sut: GetUserByIdUseCase;
  let userRepository: MemoryUserRepository;

  beforeEach(async () => {
    const memoryUserRepository = new MemoryUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        {
          provide: UserRepository,
          useValue: memoryUserRepository,
        },
      ],
    }).compile();

    sut = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
    userRepository = memoryUserRepository;
  });

  it('should be able to get a user by id', async () => {
    const user = createUserEntityFactory({
      name: 'John Doe',
      telegramUserId: 123456789,
      username: 'johndoe',
    });
    await userRepository.create(user);

    const result = await sut.execute({ id: user.id });

    expect(result).toEqual({
      id: user.id,
      telegramUserId: user.telegramUserId,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });

  it('should throw error if user does not exist', async () => {
    await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
