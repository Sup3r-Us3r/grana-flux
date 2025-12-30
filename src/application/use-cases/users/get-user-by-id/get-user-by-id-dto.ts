export interface GetUserByIdUseCaseInputDTO {
  id: string;
}

export interface GetUserByIdUseCaseOutputDTO {
  id: string;
  name: string;
  email: string;
  cpf: string;
  createdAt: Date;
  updatedAt: Date;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
  };
}
