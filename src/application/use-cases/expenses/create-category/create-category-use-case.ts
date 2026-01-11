import { Category } from '@domain/expenses/entities/category-entity';
import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { Injectable } from '@nestjs/common';
import { ValidationException } from '@shared/exceptions/validation-exception';
import {
  CreateCategoryInputDTO,
  CreateCategoryOutputDTO,
} from './create-category-dto';

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    input: CreateCategoryInputDTO,
  ): Promise<CreateCategoryOutputDTO> {
    const normalizedName = input.name.trim();

    const existingCategory =
      await this.categoryRepository.findByName(normalizedName);
    if (existingCategory) {
      throw new ValidationException(
        `Category "${normalizedName}" already exists`,
      );
    }

    const category = new Category({
      name: normalizedName,
      color: input.color,
    });

    await this.categoryRepository.create(category);

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      createdAt: category.createdAt,
    };
  }
}
