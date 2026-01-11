import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { Injectable } from '@nestjs/common';
import { ListCategoriesOutputDTO } from './list-categories-dto';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<ListCategoriesOutputDTO> {
    const categories = await this.categoryRepository.findAll();

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        color: category.color,
        createdAt: category.createdAt,
      })),
      total: categories.length,
    };
  }
}
