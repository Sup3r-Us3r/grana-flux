import { EmailProvider } from '@domain/providers/email-provider';
import { EmailTemplateService } from '@infra/email/email-template-service';
import { RedisCacheProvider } from '@infra/providers/redis-cache-provider';
import { SmtpEmailProvider } from '@infra/providers/smtp-email-provider';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebSocketModule } from '@presentation/modules/websocket-module';
import { McpModule } from './mcp-module';
import { UsersModule } from './users-module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    UsersModule,
    McpModule,
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
