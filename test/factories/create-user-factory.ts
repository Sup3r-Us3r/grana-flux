import { faker } from '@faker-js/faker/locale/pt_BR';
import { User } from '@infra/database/prisma/generated/client';

export function createUserFactory(user?: Partial<User>) {
  return {
    telegramUserId: BigInt(
      faker.number.int({ min: 100000000, max: 999999999 }),
    ),
    name: faker.person.fullName(),
    username: faker.internet.username().toLowerCase(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...user,
  } as User;
}
