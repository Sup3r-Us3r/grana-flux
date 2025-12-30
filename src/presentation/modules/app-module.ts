import { EmailProvider } from '@domain/providers/email-provider';
import { EmailTemplateService } from '@infra/email/email-template-service';
import { RedisCacheProvider } from '@infra/providers/redis-cache-provider';
import { SmtpEmailProvider } from '@infra/providers/smtp-email-provider';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebSocketModule } from '@presentation/modules/websocket-module';
import { UsersModule } from './users-module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    WebSocketModule,
  ],
  providers: [
    RedisCacheProvider,
    EmailTemplateService,
    SmtpEmailProvider,
    {
      provide: EmailProvider,
      useExisting: SmtpEmailProvider,
    },
  ],
  exports: [EmailProvider, EmailTemplateService],
})
export class AppModule {}
