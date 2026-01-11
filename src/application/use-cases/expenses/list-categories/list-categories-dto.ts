export interface ListCategoriesOutputDTO {
  categories: {
    id: string;
    name: string;
    color: string;
    createdAt: Date;
  }[];
  total: number;
}
