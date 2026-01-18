import { randomUUID } from 'node:crypto';

export interface UserProps {
  id?: string;
  telegramUserId: number;
  name: string;
  username?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  id: string;
  telegramUserId: number;
  name: string;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id ?? randomUUID();
    this.telegramUserId = props.telegramUserId;
    this.name = props.name;
    this.username = props.username ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  update(props: { name?: string }): void {
    if (props.name) {
      this.name = props.name;
    }

    this.updatedAt = new Date();
  }
}
