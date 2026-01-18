import { UserRepository } from '@domain/users/repositories/user-repository';
import { MemoryUserRepository } from '@infra/database/memory/memory-user-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { createUserEntityFactory } from '@test/factories';
import { ListUsersUseCase } from './list-users-use-case';

describe('ListUsersUseCase', () => {
  let sut: ListUsersUseCase;
  let userRepository: MemoryUserRepository;

  beforeEach(async () => {
    const memoryUserRepository = new MemoryUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersUseCase,
        {
          provide: UserRepository,
          useValue: memoryUserRepository,
        },
      ],
    }).compile();

    sut = module.get<ListUsersUseCase>(ListUsersUseCase);
    userRepository = memoryUserRepository;
  });

  it('should be able to list users', async () => {
    const user1 = createUserEntityFactory({ name: 'John Doe' });
    const user2 = createUserEntityFactory({ name: 'Jane Doe' });
    await userRepository.create(user1);
    await userRepository.create(user2);

    const result = await sut.execute({ page: 1, limit: 10 });

    expect(result.data.items).toHaveLength(2);
    expect(result.data.items[0].id).toBe(user1.id);
    expect(result.data.items[0].name).toBe(user1.name);
    expect(result.data.items[0].telegramUserId).toBe(user1.telegramUserId);
    expect(result.data.items[1].id).toBe(user2.id);
    expect(result.data.items[1].name).toBe(user2.name);
    expect(result.data.total).toBe(2);
  });

  it('should use default pagination values if not provided', async () => {
    const user = createUserEntityFactory();
    await userRepository.create(user);

    const result = await sut.execute({});

    expect(result.data.currentPage).toBe(1);
    expect(result.data.perPage).toBe(10);
    expect(result.data.items).toHaveLength(1);
  });

  it('should return empty list when no users exist', async () => {
    const result = await sut.execute({ page: 1, limit: 10 });

    expect(result.data.items).toHaveLength(0);
    expect(result.data.total).toBe(0);
  });

  it('should paginate results correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await userRepository.create(createUserEntityFactory());
    }

    const result = await sut.execute({ page: 2, limit: 2 });

    expect(result.data.items).toHaveLength(2);
    expect(result.data.total).toBe(5);
    expect(result.data.currentPage).toBe(2);
    expect(result.data.lastPage).toBe(3);
  });
});
