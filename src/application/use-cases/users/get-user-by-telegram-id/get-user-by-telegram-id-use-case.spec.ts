import { UserRepository } from '@domain/users/repositories/user-repository';
import { MemoryUserRepository } from '@infra/database/memory/memory-user-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { createUserEntityFactory } from '@test/factories';
import { GetUserByTelegramIdUseCase } from './get-user-by-telegram-id-use-case';

describe('GetUserByTelegramIdUseCase', () => {
  let sut: GetUserByTelegramIdUseCase;
  let userRepository: MemoryUserRepository;

  beforeEach(async () => {
    const memoryUserRepository = new MemoryUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByTelegramIdUseCase,
        {
          provide: UserRepository,
          useValue: memoryUserRepository,
        },
      ],
    }).compile();

    sut = module.get<GetUserByTelegramIdUseCase>(GetUserByTelegramIdUseCase);
    userRepository = memoryUserRepository;
  });

  it('should be able to find a user by telegram user id', async () => {
    const user = createUserEntityFactory({ telegramUserId: 123456789 });
    await userRepository.create(user);

    const result = await sut.execute({ telegramUserId: 123456789 });

    expect(result).not.toBeNull();
    expect(result?.id).toBe(user.id);
    expect(result?.telegramUserId).toBe(123456789);
    expect(result?.name).toBe(user.name);
  });

  it('should return null when user is not found', async () => {
    const result = await sut.execute({ telegramUserId: 999999999 });

    expect(result).toBeNull();
  });
});
