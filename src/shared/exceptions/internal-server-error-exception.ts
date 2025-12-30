import { InternalServerErrorException as InternalServerErrorExceptionError } from '@nestjs/common';

import { ApiProperty } from '@nestjs/swagger';

export class InternalServerErrorException extends InternalServerErrorExceptionError {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'Internal server error' })
  message: string;

  @ApiProperty({ example: 'Internal Server Error' })
  error: string;

  constructor(message: string) {
    super(message);
    this.name = 'InternalServerErrorException';
  }
}
