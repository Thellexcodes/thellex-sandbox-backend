import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'mail.privateemail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'hello@thellex.com',
            pass: '!Sophia2024',
          },
        },
        defaults: {
          from: `"${configService.get('APPLICATION_NAME')}" <${configService.get('GMAIL_USER')}>`, // Default sender
        },
        template: {
          dir: join(__dirname, '../..', '../src/modules/mail/templates'),
          adapter: new HandlebarsAdapter(),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MailModule {}
