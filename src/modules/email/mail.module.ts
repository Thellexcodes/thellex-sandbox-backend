import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { getAppConfig } from '@/constants/env';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: 'mail.privateemail.com',
          port: 465,
          secure: true,
          auth: {
            user: getAppConfig().EMAIL.SUPPORT_USER,
            pass: getAppConfig().EMAIL.SUPPORT_PASSWORD,
          },
        },
        defaults: {
          from: `"${getAppConfig().EMAIL.APPLICATION_NAME}" <${getAppConfig().EMAIL.SUPPORT_USER}>`,
        },
        template: {
          dir: join(process.cwd() + '/src/modules', 'email/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [],
    }),
  ],
})
export class MailModule {}
