import { EmailProvider } from '@domain/providers/email-provider';
import { HashProvider } from '@domain/providers/hash-provider';
import { CpfVO } from '@domain/shared/value-objects/cpf-vo';
import { EmailVO } from '@domain/shared/value-objects/email-vo';
import { User } from '@domain/users/entities/user-entity';
import { UserRepository } from '@domain/users/repositories/user-repository';
import { AddressVO } from '@domain/users/value-objects/address-vo';
import { EmailTemplateService } from '@infra/email/email-template-service';
import { WelcomeEmailTemplate } from '@infra/email/templates/welcome-email-template';
import { UserEventsPublisher } from '@infra/messaging/publishers/users/user-events-publisher/user-events-publisher';
import { UserGateway } from '@infra/websocket/gateways/users/user-gateway';
import { Injectable, Logger } from '@nestjs/common';
import { ValidationException } from '@shared/exceptions/validation-exception';
import * as React from 'react';
import {
  CreateUserUseCaseInputDTO,
  CreateUserUseCaseOutputDTO,
} from './create-user-dto';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashProvider: HashProvider,
    private readonly userEventsPublisher: UserEventsPublisher,
    private readonly userGateway: UserGateway,
    private readonly emailProvider: EmailProvider,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async execute(
    input: CreateUserUseCaseInputDTO,
  ): Promise<CreateUserUseCaseOutputDTO> {
    const emailExists = await this.userRepository.findByEmail(input.email);
    if (emailExists) {
      throw new ValidationException('Email already exists');
    }

    const hashedPassword = await this.hashProvider.hash(input.password);

    const user = new User({
      name: input.name,
      email: new EmailVO(input.email),
      password: hashedPassword,
      cpf: new CpfVO(input.cpf),
      address: new AddressVO({
        street: input.street,
        number: input.number,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        complement: input.complement,
      }),
    });

    await this.userRepository.create(user);
    await this.userEventsPublisher.publishUserCreated({
      id: user.id,
      name: user.name,
      email: user.email.value,
      cpf: user.cpf.value,
      createdAt: user.createdAt,
    });
    this.userGateway.emitUserCreated({
      id: user.id,
      name: user.name,
      email: user.email.value,
      cpf: user.cpf.value,
      createdAt: user.createdAt,
    });

    // Send welcome email
    try {
      const welcomeTemplate = React.createElement(WelcomeEmailTemplate, {
        name: user.name,
      });
      const html =
        await this.emailTemplateService.renderTemplate(welcomeTemplate);
      await this.emailProvider.sendEmail({
        to: user.email.value,
        subject: 'Bem-vindo!',
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error}`);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      createdAt: user.createdAt,
    };
  }
}
