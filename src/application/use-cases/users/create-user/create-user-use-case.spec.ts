import { UserRepository } from '@domain/users/repositories/user-repository';
import { MemoryUserRepository } from '@infra/database/memory/memory-user-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationException } from '@shared/exceptions/validation-exception';
import { createUserEntityFactory } from '@test/factories';
import { CreateUserUseCase } from './create-user-use-case';

describe('CreateUserUseCase', () => {
  let sut: CreateUserUseCase;
  let userRepository: MemoryUserRepository;

  beforeEach(async () => {
    vi.clearAllMocks();
    const memoryUserRepository = new MemoryUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: UserRepository,
          useValue: memoryUserRepository,
        },
      ],
    }).compile();

    sut = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = memoryUserRepository;
  });

  it('should be able to create a new user', async () => {
    const input = {
      telegramUserId: 123456789,
      name: 'John Doe',
      username: 'johndoe',
    };

    const result = await sut.execute(input);

    expect(result).toHaveProperty('id');
    expect(result.telegramUserId).toBe(input.telegramUserId);
    expect(result.name).toBe(input.name);
    expect(result.username).toBe(input.username);

    const savedUser = await userRepository.findByTelegramUserId(
      input.telegramUserId,
    );
    expect(savedUser).not.toBeNull();
    expect(savedUser?.name).toBe(input.name);
  });

  it('should be able to create a user without username', async () => {
    const input = {
      telegramUserId: 123456789,
      name: 'John Doe',
    };

    const result = await sut.execute(input);

    expect(result.username).toBeNull();
  });

  it('should not be able to create a user with same telegram user id', async () => {
    const existingUser = createUserEntityFactory({
      telegramUserId: 123456789,
    });
    await userRepository.create(existingUser);

    const input = {
      telegramUserId: 123456789,
      name: 'John Doe',
      username: 'johndoe',
    };

    await expect(sut.execute(input)).rejects.toThrow(ValidationException);
  });
});
