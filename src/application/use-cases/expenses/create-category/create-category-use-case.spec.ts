import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { MemoryCategoryRepository } from '@infra/database/memory/memory-category-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationException } from '@shared/exceptions/validation-exception';
import { CreateCategoryUseCase } from './create-category-use-case';

describe('CreateCategoryUseCase', () => {
  let sut: CreateCategoryUseCase;
  let categoryRepository: MemoryCategoryRepository;

  beforeEach(async () => {
    const memoryCategoryRepository = new MemoryCategoryRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCategoryUseCase,
        {
          provide: CategoryRepository,
          useValue: memoryCategoryRepository,
        },
      ],
    }).compile();

    sut = module.get<CreateCategoryUseCase>(CreateCategoryUseCase);
    categoryRepository = memoryCategoryRepository;
  });

  it('should be able to create a new category', async () => {
    const input = {
      name: 'Alimentação',
      color: '#FF5733',
    };

    const result = await sut.execute(input);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(input.name);
    expect(result.color).toBe(input.color);
    expect(result).toHaveProperty('createdAt');

    const savedCategory = await categoryRepository.findByName(input.name);
    expect(savedCategory).not.toBeNull();
    expect(savedCategory?.name).toBe(input.name);
  });

  it('should be able to create a category with default color', async () => {
    const input = {
      name: 'Transporte',
    };

    const result = await sut.execute(input);

    expect(result.name).toBe(input.name);
    expect(result.color).toBe('#6366f1'); // Default color
  });

  it('should not be able to create a category with same name', async () => {
    const input = {
      name: 'Alimentação',
    };

    await sut.execute(input);

    await expect(sut.execute(input)).rejects.toThrow(ValidationException);
  });

  it('should trim category name', async () => {
    const input = {
      name: '  Saúde  ',
    };

    const result = await sut.execute(input);

    expect(result.name).toBe('Saúde');
  });
});
