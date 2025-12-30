import { ValidationException } from '@shared/exceptions/validation-exception';

export class EmailVO {
  public readonly value: string;

  constructor(value: string) {
    this.validate(value);

    this.value = value;
  }

  private validate(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      throw new ValidationException('Invalid email format');
    }
  }
}
