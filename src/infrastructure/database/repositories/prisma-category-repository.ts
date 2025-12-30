import { Category } from '@domain/expenses/entities/category-entity';
import { CategoryRepository } from '@domain/expenses/repositories/category-repository';
import { PrismaService } from '@infra/database/prisma/prisma-service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<void> {
    await this.prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        color: category.color,
        createdAt: category.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) return null;

    return new Category({
      id: category.id,
      name: category.name,
      color: category.color ?? undefined,
      createdAt: category.createdAt,
    });
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });

    if (!category) return null;

    return new Category({
      id: category.id,
      name: category.name,
      color: category.color ?? undefined,
      createdAt: category.createdAt,
    });
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return categories.map(
      (category) =>
        new Category({
          id: category.id,
          name: category.name,
          color: category.color ?? undefined,
          createdAt: category.createdAt,
        }),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async findOrCreate(name: string): Promise<Category> {
    const normalizedName = name.trim();

    const existing = await this.findByName(normalizedName);
    if (existing) return existing;

    const category = new Category({ name: normalizedName });
    await this.create(category);

    return category;
  }
}
