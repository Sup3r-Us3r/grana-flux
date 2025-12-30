import { ValidationException } from '@shared/exceptions/validation-exception';

export class MoneyVO {
  public readonly value: number;
  public readonly currency: string;

  constructor(value: number, currency: string = 'BRL') {
    this.validate(value);

    this.value = Math.round(value * 100) / 100;
    this.currency = currency;
  }

  get formatted(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency,
    }).format(this.value);
  }

  add(other: MoneyVO): MoneyVO {
    return new MoneyVO(this.value + other.value, this.currency);
  }

  subtract(other: MoneyVO): MoneyVO {
    return new MoneyVO(this.value - other.value, this.currency);
  }

  private validate(value: number): void {
    if (value < 0) {
      throw new ValidationException('Amount cannot be negative');
    }
  }
}
