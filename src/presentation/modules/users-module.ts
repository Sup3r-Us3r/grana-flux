import { CreateUserUseCase } from '@application/use-cases/users/create-user/create-user-use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user/delete-user-use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id/get-user-by-id-use-case';
import { GetUserByTelegramIdUseCase } from '@application/use-cases/users/get-user-by-telegram-id/get-user-by-telegram-id-use-case';
import { ListUsersUseCase } from '@application/use-cases/users/list-users/list-users-use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user/update-user-use-case';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { PrismaService } from '@infra/database/prisma/prisma-service';
import { PrismaUserRepository } from '@infra/database/repositories/prisma-user-repository';
import { UserCreatedConsumer } from '@infra/messaging/consumers/users/user-created/user-created-consumer';
import { UserUpdatedConsumer } from '@infra/messaging/consumers/users/user-updated/user-updated-consumer';
import { UserEventsPublisher } from '@infra/messaging/publishers/users/user-events-publisher/user-events-publisher';
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
    GetUserByTelegramIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
    // Consumers & Publisher
    UserCreatedConsumer,
    UserUpdatedConsumer,
    UserEventsPublisher,
    // Repositories Mappings
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [CreateUserUseCase, GetUserByIdUseCase, GetUserByTelegramIdUseCase],
})
export class UsersModule {}
