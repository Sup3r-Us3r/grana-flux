import { User } from '@domain/users/entities/user-entity';
import { faker } from '@faker-js/faker/locale/pt_BR';

interface CreateUserEntityInput {
  id?: string;
  telegramUserId?: number;
  name?: string;
  username?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export function createUserEntityFactory(input?: CreateUserEntityInput): User {
  const defaultInput = {
    telegramUserId: faker.number.int({ min: 100000000, max: 999999999 }),
    name: faker.person.fullName(),
    username: faker.internet.username().toLowerCase(),
    ...input,
  };

  return new User({
    id: input?.id,
    telegramUserId: defaultInput.telegramUserId,
    name: defaultInput.name,
    username: defaultInput.username,
    createdAt: input?.createdAt,
    updatedAt: input?.updatedAt,
  });
}
