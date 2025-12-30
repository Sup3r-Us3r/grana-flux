import { EmailProvider } from '@domain/providers/email-provider';
import { HashProvider } from '@domain/providers/hash-provider';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { MemoryUserRepository } from '@infra/database/memory/memory-user-repository';
import { EmailTemplateService } from '@infra/email/email-template-service';
import { UserEventsPublisher } from '@infra/messaging/publishers/users/user-events-publisher/user-events-publisher';
import { UserGateway } from '@infra/websocket/gateways/users/user-gateway';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationException } from '@shared/exceptions/validation-exception';
import { createUserEntityFactory } from '@test/factories';
import { CreateUserUseCase } from './create-user-use-case';

describe('CreateUserUseCase', () => {
  let sut: CreateUserUseCase;
  let userRepository: MemoryUserRepository;
  let hashProvider: HashProvider;
  let userEventsPublisher: UserEventsPublisher;
  let userGateway: UserGateway;

  const mockHashProvider = {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  };

  const mockUserEventsPublisher = {
    publishUserCreated: vi.fn(),
  };

  const mockUserGateway = {
    emitUserCreated: vi.fn(),
  };

  const mockEmailProvider = {
    sendEmail: vi.fn(),
  };

  const mockEmailTemplateService = {
    renderTemplate: vi.fn(),
  };

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
        {
          provide: HashProvider,
          useValue: mockHashProvider,
        },
        {
          provide: UserEventsPublisher,
          useValue: mockUserEventsPublisher,
        },
        {
          provide: UserGateway,
          useValue: mockUserGateway,
        },
        {
          provide: EmailProvider,
          useValue: mockEmailProvider,
        },
        {
          provide: EmailTemplateService,
          useValue: mockEmailTemplateService,
        },
      ],
    }).compile();

    sut = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = memoryUserRepository;
    hashProvider = module.get<HashProvider>(HashProvider);
    userEventsPublisher = module.get<UserEventsPublisher>(UserEventsPublisher);
    userGateway = module.get<UserGateway>(UserGateway);
  });

  it('should be able to create a new user', async () => {
    const input = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      cpf: '52998224725', // Valid CPF
      street: 'Main Street',
      number: '123',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    };

    const result = await sut.execute(input);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(input.name);
    expect(result.email).toBe(input.email);
    expect(hashProvider.hash).toHaveBeenCalledWith(input.password);
    expect(userEventsPublisher.publishUserCreated).toHaveBeenCalled();
    expect(userGateway.emitUserCreated).toHaveBeenCalled();

    const savedUser = await userRepository.findByEmail(input.email);
    expect(savedUser).not.toBeNull();
    expect(savedUser?.name).toBe(input.name);
  });

  it('should not be able to create a user with same email', async () => {
    const existingUser = createUserEntityFactory({
      email: 'john.doe@example.com',
    });
    await userRepository.create(existingUser);

    const input = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      cpf: '52998224725',
      street: 'Main Street',
      number: '123',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    };

    await expect(sut.execute(input)).rejects.toThrow(ValidationException);
  });
});
