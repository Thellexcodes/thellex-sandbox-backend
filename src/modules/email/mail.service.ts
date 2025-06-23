import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { getAppConfig } from '@/constants/env';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

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
          name: getAppConfig().EMAIL.APPLICATION_NAME,
          address: getAppConfig().EMAIL.MAIL_USER,
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
