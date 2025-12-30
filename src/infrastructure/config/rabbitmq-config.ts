export const RABBITMQ_EXCHANGES = {
  USERS: 'users',
  USERS_DLX: 'users.dlx',
} as const;

export const RABBITMQ_QUEUES = {
  USERS_CREATED: 'users.created',
  USERS_UPDATED: 'users.updated',
  USERS_CREATED_DLQ: 'users.created.dlq',
  USERS_UPDATED_DLQ: 'users.updated.dlq',
} as const;

export const RABBITMQ_ROUTING_KEYS = {
  USER_CREATED: 'users.created',
  USER_UPDATED: 'users.updated',
} as const;

export interface RabbitMQSetup {
  exchange: string;
  type: 'topic' | 'direct' | 'fanout';
  dlx: string;
  queues: {
    name: string;
    routingKey: string;
    dlq: string;
  }[];
}

export const RABBITMQ_SETUP: RabbitMQSetup[] = [
  {
    exchange: RABBITMQ_EXCHANGES.USERS,
    type: 'topic',
    dlx: RABBITMQ_EXCHANGES.USERS_DLX,
    queues: [
      {
        name: RABBITMQ_QUEUES.USERS_CREATED,
        routingKey: RABBITMQ_ROUTING_KEYS.USER_CREATED,
        dlq: RABBITMQ_QUEUES.USERS_CREATED_DLQ,
      },
      {
        name: RABBITMQ_QUEUES.USERS_UPDATED,
        routingKey: RABBITMQ_ROUTING_KEYS.USER_UPDATED,
        dlq: RABBITMQ_QUEUES.USERS_UPDATED_DLQ,
      },
    ],
  },
];
