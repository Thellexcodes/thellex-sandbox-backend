import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IUserDto, UserEntity } from '@/utils/typeorm/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { JwtPayload } from '@/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { formatUserWithTiers, generateUniqueUid } from '@/utils/helpers';
import { UserErrorEnum } from '@/models/user-error.enum';
import { TierEnum } from '@/config/tier.lists';
import { plainToInstance } from 'class-transformer';
import { SendEmailOptions, TransportTypes } from '@/models/email-types';
import {
  BaseFindArgs,
  dynamicQuery,
  FindManyArgs,
  findManyDynamic,
  findOneDynamic,
} from '@/utils/DynamicSource';
import { MailService } from '@/modules/email/mail.service';
import { QwalletService } from '@/modules/wallets/qwallet/qwallet.service';
import { CwalletService } from '@/modules/wallets/cwallet/cwallet.service';
import { CreateUserDto } from '../dto/user.dto';
import { VerifyUserDto } from '../dto/verify-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(AuthVerificationCodesEntity)
    private readonly authenticationRepository: Repository<AuthVerificationCodesEntity>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string; expires_at?: Date }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let user: UserEntity;

    try {
      const email = createUserDto.email.toLowerCase();

      user = await this.findOne({ email, fields: 'id,email' });

      if (user) {
        const expires_at = await this.resendVerification(user);
        const access_token = await this.signToken({ id: user.id });
        return { access_token, expires_at };
      }

      const uid = await generateUniqueUid(email, this.userRepository);

      const newUser = this.userRepository.create({
        email,
        uid,
      });

      // // Save user inside the transaction
      user = await queryRunner.manager.save(newUser);

      // Commit first to persist the user in DB
      await queryRunner.commitTransaction();
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error('User creation failed:', error);
      throw new CustomHttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }

    // Now it's safe to call services that depend on committed data
    const { expires_at } = await this.emailVerificationComposer(
      user,
      'support',
    );
    const access_token = await this.signToken({ id: user.id });
    return { access_token, expires_at };
  }

  private async resendVerification(user: UserEntity): Promise<Date> {
    const existingCode = await this.authenticationRepository.findOne({
      where: {
        user: { id: user.id },
        expired: false,
      },
      order: { expires_at: 'DESC' },
    });

    if (existingCode && existingCode.expires_at > new Date()) {
      throw new CustomHttpException(
        UserErrorEnum.CODE_ALREADY_SENT,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const { expires_at } = await this.emailVerificationComposer(
      user,
      'support',
    );
    return expires_at;
  }

  async authenticateLogin(user: UserEntity): Promise<IUserDto> {
    if (!user) {
      throw new CustomHttpException(
        UserErrorEnum.INVALID_CREDENTIAL,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!user.emailVerified) {
      throw new CustomHttpException(
        UserErrorEnum.EMAIL_NOT_VERIFIED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userData = await this.findOne({
      id: user.id,
      fields: 'id, email, role, tier, uid',
      relations: 'kyc',
    });

    const userPlain = formatUserWithTiers(userData);

    return plainToInstance(IUserDto, userPlain, {
      excludeExtraneousValues: true,
    });
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error('Error finding user by email:', error);
      return null;
    }
  }

  async emailVerificationComposer(
    user: UserEntity,
    fromType: TransportTypes = 'support',
  ): Promise<{ expires_at: Date }> {
    const { code, expires_at } = await this.generateAuthVerificationCode(
      'email',
      user,
    );

    const emailOptions: SendEmailOptions = {
      to: user.email,
      template: 'auth-code',
      context: { code },
      subject: 'Verify your account',
      transport: fromType,
    };

    await this.mailService.sendEmail(emailOptions);
    return { expires_at };
  }

  async generateAuthVerificationCode(
    type: 'email' | 'phone',
    user: UserEntity,
  ): Promise<{ code: number; expires_at: Date }> {
    let code: number;
    let exists: boolean | AuthVerificationCodesEntity = true;

    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000);
      exists = await this.authenticationRepository.findOne({ where: { code } });
    }
    const newCode = new AuthVerificationCodesEntity();
    newCode.user = user;
    newCode.code = code;

    const res = await this.authenticationRepository.save(newCode);

    return { code, expires_at: res.expires_at };
  }

  async signToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyUser(
    verifyUserDto: VerifyUserDto,
    user: UserEntity,
  ): Promise<IUserDto> {
    const { code } = verifyUserDto;

    const auth = await this.authenticationRepository.findOne({
      where: {
        code,
        user: { id: user.id },
      },
    });

    if (!auth) {
      throw new CustomHttpException(
        'Verification code not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (auth.expired) {
      throw new CustomHttpException(
        'Verification code has expired',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (auth.code !== code) {
      throw new CustomHttpException(
        UserErrorEnum.REJECTED_AGREEMENT,
        HttpStatus.FORBIDDEN,
      );
    }

    if (user.emailVerified) {
      const verifiedUser = await this.findOne({
        id: user.id,
        fields: 'email,id,role,tier,uid,emailVerified',
        relations: 'kyc',
      });

      if (!verifiedUser)
        throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);

      const userPlain = formatUserWithTiers(verifiedUser);
      return plainToInstance(IUserDto, userPlain, {
        excludeExtraneousValues: true,
      });
    }

    // First-time verification flow
    user.emailVerified = true;
    auth.expired = true;

    await Promise.all([
      this.authenticationRepository.save(auth),
      this.userRepository.save(user),
      this.qwalletService.ensureUserHasProfileAndWallets(user),
      this.cwalletService.ensureUserHasProfileAndWallets(user),
    ]);

    const updatedUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!updatedUser)
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);

    const userPlain = formatUserWithTiers(updatedUser);

    return plainToInstance(IUserDto, userPlain, {
      excludeExtraneousValues: true,
    });
  }

  async updateUserTier(userId: string, newTier: TierEnum): Promise<void> {
    await this.userRepository.update(userId, { tier: newTier });
  }

  async findOne(args: BaseFindArgs) {
    const options = dynamicQuery<UserEntity>('findOne', args);
    return await findOneDynamic(this.userRepository, options);
  }

  async findMany(args: FindManyArgs) {
    const options = dynamicQuery<UserEntity>('findMany', args);
    return await findManyDynamic(this.userRepository, options);
  }
}
