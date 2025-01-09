import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  async sendEmail({
    to,
    subject,
    template: templateName,
    context,
  }: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, number>;
  }) {
    try {
      const mailData = {
        from: {
          name: this.configService.get<string>('APPLICATION_NAME'),
          address: this.configService.get<string>('GMAIL_USER'),
        },
        to,
        templateName,
        subject,
        context,
        html: `Your authenication code is: <b>${context.code}</b>`,
      };

      return await this.mailerService.sendMail(mailData);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
