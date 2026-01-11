export interface CreateCategoryInputDTO {
  name: string;
  color?: string;
}

export interface CreateCategoryOutputDTO {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}
