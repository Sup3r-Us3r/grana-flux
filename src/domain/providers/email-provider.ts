export interface SendEmailData {
  to: string;
  subject: string;
  html: string;
}

export abstract class EmailProvider {
  abstract sendEmail(data: SendEmailData): Promise<void>;
}
