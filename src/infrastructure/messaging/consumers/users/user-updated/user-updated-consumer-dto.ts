import { PartialType } from '@nestjs/swagger';
import { UserCreatedConsumerDTO } from '../user-created/user-created-consumer-dto';

export class UserUpdatedConsumerDTO extends PartialType(
  UserCreatedConsumerDTO,
) {}
