import { CreateUserUseCase } from '@application/use-cases/users/create-user/create-user-use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user/delete-user-use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id/get-user-by-id-use-case';
import { ListUsersUseCase } from '@application/use-cases/users/list-users/list-users-use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user/update-user-use-case';
import { HashProvider } from '@domain/providers/hash-provider';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { PrismaService } from '@infra/database/prisma/prisma-service';
import { PrismaUserRepository } from '@infra/database/repositories/prisma-user-repository';
import { UserCreatedConsumer } from '@infra/messaging/consumers/users/user-created/user-created-consumer';
import { UserUpdatedConsumer } from '@infra/messaging/consumers/users/user-updated/user-updated-consumer';
import { UserEventsPublisher } from '@infra/messaging/publishers/users/user-events-publisher/user-events-publisher';
import { BcryptHashProvider } from '@infra/providers/bcrypt-hash-provider';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from '../http/controllers/users-controller';
import { AppModule } from './app-module';
import { RabbitMQModule } from './rabbitmq-module';

@Module({
  imports: [RabbitMQModule, forwardRef(() => AppModule)],
  controllers: [UsersController],
  providers: [
    PrismaService,
    CreateUserUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
    // Consumers & Publisher
    UserCreatedConsumer,
    UserUpdatedConsumer,
    UserEventsPublisher,
    // Repositories & Providers Mappings
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: HashProvider,
      useClass: BcryptHashProvider,
    },
  ],
})
export class UsersModule {}
