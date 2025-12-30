import { CpfVO } from '@domain/shared/value-objects/cpf-vo';
import { EmailVO } from '@domain/shared/value-objects/email-vo';
import { User } from '@domain/users/entities/user-entity';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { AddressVO } from '@domain/users/value-objects/address-vo';
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

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { email } });

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
      name: prismaUser.name,
      email: new EmailVO(prismaUser.email),
      password: prismaUser.password,
      cpf: new CpfVO(prismaUser.cpf),
      address: new AddressVO({
        street: prismaUser.street,
        number: prismaUser.number,
        city: prismaUser.city,
        state: prismaUser.state,
        zipCode: prismaUser.zipCode,
        complement: prismaUser.complement ?? undefined,
      }),
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  private toPrisma(user: User): PrismaUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      password: user.password,
      cpf: user.cpf.value,
      street: user.address.street,
      number: user.address.number,
      city: user.address.city,
      state: user.address.state,
      zipCode: user.address.zipCode,
      complement: user.address.complement ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
