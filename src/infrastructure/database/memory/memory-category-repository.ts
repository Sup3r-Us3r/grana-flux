import { Category } from '@domain/expenses/entities/category-entity';
import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];

  async create(category: Category): Promise<void> {
    this.categories.push(category);
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.find((c) => c.id === id) ?? null;
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categories.find((c) => c.name === name) ?? null;
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories].sort((a, b) => a.name.localeCompare(b.name));
  }

  async delete(id: string): Promise<void> {
    this.categories = this.categories.filter((c) => c.id !== id);
  }
}
