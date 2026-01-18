import { User } from '@domain/users/entities/user-entity';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import { PaginationType } from '@shared/types/pagination-type';

@Injectable()
export class MemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async create(user: User): Promise<void> {
    this.users.push(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByTelegramUserId(telegramUserId: number): Promise<User | null> {
    const user = this.users.find((u) => u.telegramUserId === telegramUserId);
    return user || null;
  }

  async update(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  async findAll(page: number, limit: number): Promise<PaginationType<User>> {
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = this.users.slice(start, end);

    return {
      items,
      total: this.users.length,
      currentPage: page,
      perPage: limit,
      lastPage: Math.ceil(this.users.length / limit),
    };
  }

  reset(): void {
    this.users = [];
  }
}
