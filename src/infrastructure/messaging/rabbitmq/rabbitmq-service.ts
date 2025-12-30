import { RABBITMQ_SETUP } from '@infra/config/rabbitmq-config';
import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: amqp.ChannelWrapper;
  private logger = new Logger(RabbitMQService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.connection = amqp.connect([
      this.configService.getOrThrow<string>('RABBITMQ_URI'),
    ]);
    this.connection.on('connect', () =>
      this.logger.log('Connected to RabbitMQ'),
    );
    this.connection.on('disconnect', (err) =>
      this.logger.error('Disconnected from RabbitMQ', err),
    );

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel: Channel) => {
        for (const setup of RABBITMQ_SETUP) {
          // Assert DLX
          await channel.assertExchange(setup.dlx, 'topic', { durable: true });

          // Assert Main Exchange
          await channel.assertExchange(setup.exchange, setup.type, {
            durable: true,
          });

          for (const queue of setup.queues) {
            // Assert DLQ
            await channel.assertQueue(queue.dlq, { durable: true });
            await channel.bindQueue(queue.dlq, setup.dlx, queue.routingKey);

            // Assert Main Queue with DLX
            await channel.assertQueue(queue.name, {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': setup.dlx,
                'x-dead-letter-routing-key': queue.routingKey,
              },
            });
            await channel.bindQueue(
              queue.name,
              setup.exchange,
              queue.routingKey,
            );

            this.logger.log(
              `Setup queue: ${queue.name} bound to ${setup.exchange} with key ${queue.routingKey}`,
            );
          }
        }
      },
    });

    await this.channelWrapper.waitForConnect();
  }

  async publish<T>(
    exchange: string,
    routingKey: string,
    message: T,
  ): Promise<void> {
    await this.channelWrapper.publish(exchange, routingKey, message);
  }

  async consume<T>(
    queue: string,
    handler: (msg: T) => Promise<void>,
  ): Promise<void> {
    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.consume(queue, async (msg: ConsumeMessage | null) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString()) as T;

            await handler(content);

            channel.ack(msg);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error processing message from ${queue}`, {
              error: errorMessage,
              stack: errorStack,
              queue,
              routingKey: msg.fields.routingKey,
              exchange: msg.fields.exchange,
            });

            // Add error metadata to headers for debugging in DLQ
            const errorHeaders = {
              ...msg.properties.headers,
              'x-error-message': errorMessage,
              'x-error-stack': errorStack || 'No stack trace available',
              'x-error-timestamp': new Date().toISOString(),
              'x-original-queue': queue,
              'x-original-exchange': msg.fields.exchange,
              'x-original-routing-key': msg.fields.routingKey,
              'x-retry-count':
                ((msg.properties.headers?.['x-retry-count'] as number) || 0) +
                1,
            };

            // Publish to DLX with error metadata
            channel.publish(
              `${msg.fields.exchange}.dlx`,
              msg.fields.routingKey,
              msg.content,
              {
                ...msg.properties,
                headers: errorHeaders,
              },
            );

            // Acknowledge the original message to remove it from the queue
            channel.ack(msg);
          }
        }
      });
    });
  }

  async onModuleDestroy() {
    await this.connection.close();
  }
}
