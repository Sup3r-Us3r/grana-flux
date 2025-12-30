import { RabbitMQService } from '@infra/messaging/rabbitmq/rabbitmq-service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
