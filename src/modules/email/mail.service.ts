import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { getAppConfig } from '@/constants/env';
import { SendEmailOptions } from '@/models/email-types';
import * as hbs from 'hbs';
import { readFileSync } from 'fs';
import { join } from 'path';

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

  async notifySubscribers(
    release: { name: string; releaseNotes?: string },
    emails: string[],
  ) {
    const templatePath = join(process.cwd(), 'templates/release-email.hbs');
    const template = hbs.compile(readFileSync(templatePath, 'utf8'));

    const html = template({
      releaseId: release.name,
      notes: release.releaseNotes,
    });

    for (const email of emails) {
      await this.mailerService.sendMail({
        from: `"Thellex Beta" <${process.env.MAIL_USER}>`,
        to: email,
        subject: `New Beta Release Available`,
        html,
      });
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
