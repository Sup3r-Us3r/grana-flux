import { BadRequestException } from '@nestjs/common';

import { ApiProperty } from '@nestjs/swagger';

export class ValidationException extends BadRequestException {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
  }
}
