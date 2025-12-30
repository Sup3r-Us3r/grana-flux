import { ValidationException } from '@shared/exceptions/validation-exception';

export class CpfVO {
  public readonly value: string;

  constructor(value: string) {
    const cleanValue = value.replace(/[^\d]/g, '');
    this.validate(cleanValue);

    this.value = cleanValue;
  }

  get formatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private validate(value: string): void {
    if (value.length !== 11) {
      throw new ValidationException('CPF must have 11 digits');
    }

    if (/^(\d)\1{10}$/.test(value)) {
      throw new ValidationException('Invalid CPF');
    }

    let sum = 0;
    let remainder = 0;

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(value.substring(i - 1, i), 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(value.substring(9, 10), 10)) {
      throw new ValidationException('Invalid CPF');
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(value.substring(i - 1, i), 10) * (12 - i);
    }
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(value.substring(10, 11), 10)) {
      throw new ValidationException('Invalid CPF');
    }
  }
}
