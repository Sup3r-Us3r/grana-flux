import { randomUUID } from 'node:crypto';

export interface CategoryProps {
  id?: string;
  name: string;
  color?: string;
  createdAt?: Date;
}

export class Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id ?? randomUUID();
    this.name = props.name;
    this.color = props.color ?? '#6366f1';
    this.createdAt = props.createdAt ?? new Date();
  }
}
