import { User } from '@domain/users/entities/user-entity';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import { PaginationType } from '@shared/types/pagination-type';
import { User as PrismaUser } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma-service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: this.toPrisma(user),
    });
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    if (!prismaUser) return null;
    return this.toDomain(prismaUser);
  }

  async findByTelegramUserId(telegramUserId: number): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { telegramUserId: BigInt(telegramUserId) },
    });

    if (!prismaUser) {
      return null;
    }

    return this.toDomain(prismaUser);
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: this.toPrisma(user),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findAll(page: number, limit: number): Promise<PaginationType<User>> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: users.map((user) => this.toDomain(user)),
      total,
      currentPage: page,
      perPage: limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  private toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      telegramUserId: Number(prismaUser.telegramUserId),
      name: prismaUser.name,
      username: prismaUser.username,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  private toPrisma(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> & {
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      id: user.id,
      telegramUserId: BigInt(user.telegramUserId),
      name: user.name,
      username: user.username,
    };
  }
}
