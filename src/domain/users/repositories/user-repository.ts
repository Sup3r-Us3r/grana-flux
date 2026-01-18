import { PaginationType } from '@shared/types/pagination-type';
import { User } from '../entities/user-entity';

export abstract class UserRepository {
  abstract create(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByTelegramUserId(telegramUserId: number): Promise<User | null>;
  abstract update(user: User): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findAll(page: number, limit: number): Promise<PaginationType<User>>;
}
