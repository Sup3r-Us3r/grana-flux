import { DTOValidator } from '@shared/utils/dto-validator';
import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserCreatedConsumerDTO extends DTOValidator {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsDateString()
  @IsNotEmpty()
  createdAt: Date;

  toApplicationInput() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      cpf: this.cpf,
      createdAt: new Date(this.createdAt),
    };
  }
}
