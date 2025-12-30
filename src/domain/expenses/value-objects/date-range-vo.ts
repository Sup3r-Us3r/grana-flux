import { ValidationException } from '@shared/exceptions/validation-exception';

export class DateRangeVO {
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    this.validate(startDate, endDate);

    this.startDate = startDate;
    this.endDate = endDate;
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  getDays(): number {
    const diffTime = Math.abs(
      this.endDate.getTime() - this.startDate.getTime(),
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private validate(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new ValidationException('Start date must be before end date');
    }
  }
}
