import { Category } from '@domain/expenses/entities/category-entity';
import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { MemoryCategoryRepository } from '@infra/database/memory/memory-category-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { ListCategoriesUseCase } from './list-categories-use-case';

describe('ListCategoriesUseCase', () => {
  let sut: ListCategoriesUseCase;
  let categoryRepository: MemoryCategoryRepository;

  beforeEach(async () => {
    const memoryCategoryRepository = new MemoryCategoryRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCategoriesUseCase,
        {
          provide: CategoryRepository,
          useValue: memoryCategoryRepository,
        },
      ],
    }).compile();

    sut = module.get<ListCategoriesUseCase>(ListCategoriesUseCase);
    categoryRepository = memoryCategoryRepository;
  });

  it('should be able to list all categories', async () => {
    const category1 = new Category({ name: 'Alimentação', color: '#FF5733' });
    const category2 = new Category({ name: 'Transporte', color: '#33FF57' });

    await categoryRepository.create(category1);
    await categoryRepository.create(category2);

    const result = await sut.execute();

    expect(result.total).toBe(2);
    expect(result.categories).toHaveLength(2);
    expect(result.categories[0].name).toBe('Alimentação');
    expect(result.categories[1].name).toBe('Transporte');
  });

  it('should return empty array when no categories exist', async () => {
    const result = await sut.execute();

    expect(result.total).toBe(0);
    expect(result.categories).toHaveLength(0);
  });

  it('should return categories sorted by name', async () => {
    const categoryZ = new Category({ name: 'Zzz' });
    const categoryA = new Category({ name: 'Aaa' });
    const categoryM = new Category({ name: 'Mmm' });

    await categoryRepository.create(categoryZ);
    await categoryRepository.create(categoryA);
    await categoryRepository.create(categoryM);

    const result = await sut.execute();

    expect(result.categories[0].name).toBe('Aaa');
    expect(result.categories[1].name).toBe('Mmm');
    expect(result.categories[2].name).toBe('Zzz');
  });
});
