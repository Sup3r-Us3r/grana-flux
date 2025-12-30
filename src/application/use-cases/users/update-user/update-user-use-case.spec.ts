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

    const updatedUser = await userRepository.findById(user.id);
    expect(updatedUser?.name).toBe('Jane Doe');
  });

  it('should be able to update a user address', async () => {
    const user = createUserEntityFactory();
    await userRepository.create(user);

    const result = await sut.execute({
      id: user.id,
      street: 'New Street',
      number: '456',
      city: 'New City',
      state: 'NC',
      zipCode: '99999',
    });

    expect(result.id).toBe(user.id);

    const updatedUser = await userRepository.findById(user.id);
    expect(updatedUser?.address.street).toBe('New Street');
    expect(updatedUser?.address.number).toBe('456');
    expect(updatedUser?.address.city).toBe('New City');
    expect(updatedUser?.address.state).toBe('NC');
    expect(updatedUser?.address.zipCode).toBe('99999');
  });

  it('should throw error if user does not exist', async () => {
    await expect(
      sut.execute({ id: 'non-existent-id', name: 'Test' }),
    ).rejects.toThrow(NotFoundException);
  });
});
