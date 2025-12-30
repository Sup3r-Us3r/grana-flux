import { ValidationException } from '@shared/exceptions/validation-exception';

export interface AddressProps {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
}

export class AddressVO {
  public readonly street: string;
  public readonly number: string;
  public readonly city: string;
  public readonly state: string;
  public readonly zipCode: string;
  public readonly complement?: string;

  constructor(props: AddressProps) {
    this.validate(props);

    this.street = props.street;
    this.number = props.number;
    this.city = props.city;
    this.state = props.state;
    this.zipCode = props.zipCode;
    this.complement = props.complement;
  }

  get formatted(): string {
    return `${this.street}, ${this.number}, ${this.city}, ${this.state}, ${this.zipCode}`;
  }

  private validate(props: AddressProps): void {
    if (
      !props.street ||
      !props.number ||
      !props.city ||
      !props.state ||
      !props.zipCode
    ) {
      throw new ValidationException('Address fields cannot be empty');
    }
  }
}
