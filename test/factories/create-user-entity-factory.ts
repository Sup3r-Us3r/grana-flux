import { CpfVO } from '@domain/shared/value-objects/cpf-vo';
import { EmailVO } from '@domain/shared/value-objects/email-vo';
import { User } from '@domain/users/entities/user-entity';
import { AddressVO } from '@domain/users/value-objects/address-vo';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateCpf } from '@test/helpers';

interface CreateUserEntityInput {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  complement?: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function createUserEntityFactory(input?: CreateUserEntityInput): User {
  const defaultInput = {
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
    ...input,
  };

  const address = new AddressVO({
    street: defaultInput.street,
    number: defaultInput.number,
    city: defaultInput.city,
    state: defaultInput.state,
    zipCode: defaultInput.zipCode,
    complement: defaultInput.complement,
  });

  return new User(
    defaultInput.name,
    new EmailVO(defaultInput.email),
    defaultInput.password,
    new CpfVO(defaultInput.cpf),
    address,
    input?.id,
    input?.createdAt,
    input?.updatedAt,
  );
}
