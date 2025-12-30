export interface UserCreatedEventDTO {
  id: string;
  name: string;
  email: string;
  cpf: string;
  createdAt: Date;
}

export interface UserUpdatedEventDTO extends Partial<UserCreatedEventDTO> {}
