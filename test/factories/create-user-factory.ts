import { faker } from '@faker-js/faker/locale/pt_BR';
import { User } from '@prisma/client';
import { generateCpf } from '@test/helpers';

export function createUserFactory(user?: Partial<User>) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    cpf: generateCpf(),
    street: faker.location.street(),
    number: faker.location.buildingNumber(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode('########'),
    complement: faker.location.street(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...user,
  } as User;
}
