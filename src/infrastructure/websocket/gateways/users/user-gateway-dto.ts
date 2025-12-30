import { DTOValidator } from '@shared/utils/dto-validator';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserGatewayDTO extends DTOValidator {
  @IsString()
  @IsNotEmpty()
  message: string;

  toApplicationInput() {
    return {
      message: this.message,
    };
  }
}
