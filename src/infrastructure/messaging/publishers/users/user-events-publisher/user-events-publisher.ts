import {
  RABBITMQ_EXCHANGES,
  RABBITMQ_ROUTING_KEYS,
} from '@infra/config/rabbitmq-config';
import { RabbitMQService } from '@infra/messaging/rabbitmq/rabbitmq-service';
import { Injectable } from '@nestjs/common';
import {
  UserCreatedEventDTO,
  UserUpdatedEventDTO,
} from './user-events-publisher-dto';

@Injectable()
export class UserEventsPublisher {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publishUserCreated(event: UserCreatedEventDTO): Promise<void> {
    await this.rabbitMQService.publish(
      RABBITMQ_EXCHANGES.USERS,
      RABBITMQ_ROUTING_KEYS.USER_CREATED,
      event,
    );
  }

  async publishUserUpdated(event: UserUpdatedEventDTO): Promise<void> {
    await this.rabbitMQService.publish(
      RABBITMQ_EXCHANGES.USERS,
      RABBITMQ_ROUTING_KEYS.USER_UPDATED,
      event,
    );
  }
}
