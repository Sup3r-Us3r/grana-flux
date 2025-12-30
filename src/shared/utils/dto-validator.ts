import { ValidationException } from '@shared/exceptions/validation-exception';
import { plainToClassFromExist } from 'class-transformer';
import { validateSync } from 'class-validator';

export class DTOValidator {
  constructor(raw: unknown) {
    plainToClassFromExist(this, raw);

    const errors = validateSync(this, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
        value: error.value,
      }));

      throw new ValidationException(
        `Invalid message payload: ${JSON.stringify(formattedErrors, null, 2)}`,
      );
    }
  }
}
