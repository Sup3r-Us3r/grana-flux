import { NotFoundException as NotFoundExceptionError } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class NotFoundException extends NotFoundExceptionError {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Not found' })
  message: string;

  @ApiProperty({ example: 'Not found' })
  error: string;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundException';
  }
}
