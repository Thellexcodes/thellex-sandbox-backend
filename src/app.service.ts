import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BetaTesterEntity,
  CreateSubscribeBetaDto,
} from './utils/typeorm/entities/beta.testers.entity';
import { MailService } from './modules/email/mail.service';
import { CustomHttpException } from './middleware/custom.http.exception';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectRepository(BetaTesterEntity)
    private betaTesterRepo: Repository<BetaTesterEntity>,
    private readonly mailService: MailService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async subscribeToBeta(dto: CreateSubscribeBetaDto): Promise<any> {
    const existing = await this.betaTesterRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new CustomHttpException(
        'Email already subscribed',
        HttpStatus.CONFLICT,
      );
    }

    const newTester = this.betaTesterRepo.create({ email: dto.email });
    await this.betaTesterRepo.save(newTester);

    await this.mailService.sendEmail({
      to: dto.email,
      subject: 'Welcome to Thellex Beta!',
      template: 'beta-welcome',
      context: {
        email: dto.email,
        miStoreUrl: 'https://app.mi.com/details?id=your.app.id',
      },
      transport: 'support',
    });

    return { key: 'success', msg: 'Subscribed' };
  }
}
