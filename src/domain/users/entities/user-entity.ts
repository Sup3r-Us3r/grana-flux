import { randomUUID } from 'node:crypto';
import { CpfVO } from '@domain/shared/value-objects/cpf-vo';
import { EmailVO } from '@domain/shared/value-objects/email-vo';
import { AddressVO } from '../value-objects/address-vo';

export interface UserProps {
  id?: string;
  name: string;
  email: EmailVO;
  password: string;
  cpf: CpfVO;
  address: AddressVO;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  id: string;
  name: string;
  email: EmailVO;
  password: string;
  cpf: CpfVO;
  address: AddressVO;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id ?? randomUUID();
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.cpf = props.cpf;
    this.address = props.address;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  update(props: { name?: string; address?: AddressVO }): void {
    if (props.name) {
      this.name = props.name;
    }

    if (props.address) {
      this.address = props.address;
    }

    this.updatedAt = new Date();
  }
}
