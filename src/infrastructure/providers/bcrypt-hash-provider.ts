import { HashProvider } from '@domain/providers/hash-provider';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptHashProvider implements HashProvider {
  async hash(payload: string): Promise<string> {
    return bcrypt.hash(payload, 10);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
