import { EmailProvider, SendEmailData } from '@domain/providers/email-provider';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    this.from = this.configService.get<string>('SMTP_FROM', 'noreply@api.com');

    this.logger.log(
      `SMTP Config: host=${host}, port=${port}, from=${this.from}`,
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });
  }

  async sendEmail(data: SendEmailData): Promise<void> {
    this.logger.log(`Sending email to ${data.to}: ${data.subject}`);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      this.logger.log('Email sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
      throw error;
    }
  }
}
