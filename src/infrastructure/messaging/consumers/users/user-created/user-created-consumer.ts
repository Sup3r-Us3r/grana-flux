import { RABBITMQ_QUEUES } from '@infra/config/rabbitmq-config';
import { RabbitMQService } from '@infra/messaging/rabbitmq/rabbitmq-service';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { UserCreatedConsumerDTO } from './user-created-consumer-dto';

@Injectable()
export class UserCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserCreatedConsumer.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    await this.rabbitMQService.consume<UserCreatedConsumerDTO>(
      RABBITMQ_QUEUES.USERS_CREATED,
      async (msg) => {
        this.logger.log(
          `Received message from ${RABBITMQ_QUEUES.USERS_CREATED}`,
        );
        const dto = new UserCreatedConsumerDTO(msg);
        this.logger.log(
          'Processed User Created Event',
          dto.toApplicationInput(),
        );
      },
    );
  }
}
