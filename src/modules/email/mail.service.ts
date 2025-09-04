import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { getAppConfig } from '@/constants/env';
import { SendEmailOptions } from '@/models/email-types';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail({
    to,
    subject,
    template,
    context,
    transport,
  }: SendEmailOptions) {
    try {
      if (!to || !subject || !template) {
        console.error(
          `Invalid input: to=${to}, subject=${subject}, template=${template}`,
        );
        throw new BadRequestException(
          'To, subject, and template must be provided',
        );
      }

      const mailData = {
        from: {
          name: 'Thellex',
          address: getAppConfig().EMAIL[`${transport.toUpperCase()}_USER`],
        },
        to,
        subject,
        template: `./${template}`,
        context: { ...context, subject },
      };

      return await this.mailerService.sendMail(mailData);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // async sendEmail({
  //   to,
  //   subject,
  //   template,
  //   context,
  //   transport,
  // }: SendEmailOptions) {
  //   try {
  //     const transporter = createTransport({
  //       host: 'mail.privateemail.com',
  //       port: 465,
  //       secure: true,
  //       auth: {
  //         user: getAppConfig().EMAIL[`${transport.toUpperCase()}_USER`],
  //         pass: getAppConfig().EMAIL[`${transport.toUpperCase()}_PASSWORD`],
  //       },
  //     });

  //     const mailData = {
  //       from: {
  //         name: 'Thellex',
  //         address: getAppConfig().EMAIL[`${transport.toUpperCase()}_USER`],
  //       },
  //       to,
  //       subject,
  //       template: `./${template}`,
  //       context: { ...context, subject },
  //     };

  //     return await transporter.sendMail(mailData);
  //   } catch (err) {
  //     console.error('Error sending email:', err);
  //     throw err;
  //   }
  // }
}
