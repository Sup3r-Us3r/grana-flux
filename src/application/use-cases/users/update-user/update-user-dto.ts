export interface UpdateUserUseCaseInputDTO {
  id: string;
  name?: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  complement?: string;
}

export interface UpdateUserUseCaseOutputDTO {
  id: string;
  name: string;
  email: string;
  updatedAt: Date;
}
