import { Category } from '../entities/category-entity';

export abstract class CategoryRepository {
  abstract create(category: Category): Promise<void>;
  abstract findById(id: string): Promise<Category | null>;
  abstract findByName(name: string): Promise<Category | null>;
  abstract findAll(): Promise<Category[]>;
  abstract delete(id: string): Promise<void>;
  abstract findOrCreate(name: string): Promise<Category>;
}
