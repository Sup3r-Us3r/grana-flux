import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { RABBITMQ_QUEUES } from '../../../../config/rabbitmq-config';
import { RabbitMQService } from '../../../rabbitmq/rabbitmq-service';
import { UserUpdatedConsumerDTO } from './user-updated-consumer-dto';

@Injectable()
export class UserUpdatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserUpdatedConsumer.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    await this.rabbitMQService.consume<UserUpdatedConsumerDTO>(
      RABBITMQ_QUEUES.USERS_UPDATED,
      async (msg) => {
        this.logger.log(
          `Received message from ${RABBITMQ_QUEUES.USERS_UPDATED}`,
        );
        const _dto = new UserUpdatedConsumerDTO(msg);
        // this.logger.log('Processed User Updated Event', dto.toApplicationInput());
      },
    );
  }
}
