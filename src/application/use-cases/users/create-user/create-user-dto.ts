export interface CreateUserUseCaseInputDTO {
  name: string;
  email: string;
  password: string;
  cpf: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
}

export interface CreateUserUseCaseOutputDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
