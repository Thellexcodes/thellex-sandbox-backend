import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { IUserDto, UserEntity } from '@/utils/typeorm/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { JwtPayload } from '@/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { LoginUserDto } from './dto/login-user.dto';
import { MailService } from '../email/mail.service';
import { VerifyUserDto } from './dto/verify-user.dto';
import { formatUserWithTiers, generateUniqueUid } from '@/utils/helpers';
import { UserErrorEnum } from '@/models/user-error.enum';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { TierEnum } from '@/config/tier.lists';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@/config/config.service';
import { getAppConfig } from '@/constants/env';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AuthVerificationCodesEntity)
    private readonly authenticationRepository: Repository<AuthVerificationCodesEntity>,
    private readonly configService: ConfigService,
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
      user = await this.findOneByEmail(email);

      if (user) {
        const expires_at = await this.resendVerification(user);
        const access_token = await this.signToken({ id: user.id });
        return { access_token, expires_at };
      }

      const uid = await generateUniqueUid(this.userRepository);

      const newUser = this.userRepository.create({
        email,
        uid,
      });

      // Save user inside the transaction
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
    const { expires_at } = await this.emailVerificationComposer(user);
    const access_token = await this.signToken({ id: user.id });
    return { access_token, expires_at };
  }

  /**
   * Resends verification code only if no valid unexpired and unused code exists.
   * Throws error if a valid code is still active and unused.
   */
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

    const { expires_at } = await this.emailVerificationComposer(user);
    return expires_at;
  }

  async login(loginUserDto: LoginUserDto): Promise<IUserDto> {
    const identifier = loginUserDto.identifier.trim().toLowerCase();

    const user = await this.findOneByEmail(identifier);
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

    const userPlain = formatUserWithTiers(user);

    console.log(userPlain.transactionHistory);

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

  async findOneById(id: string): Promise<UserEntity> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error finding user by ID', error);
      throw new CustomHttpException(
        'Error retrieving user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async emailVerificationComposer(
    user: UserEntity,
  ): Promise<{ expires_at: Date }> {
    const { code, expires_at } = await this.generateAuthVerificationCode(
      'email',
      user,
    );

    const emailOptions = {
      to: user.email,
      from: getAppConfig().EMAIL.MAIL_USER,
      subject: 'Verify your account',
      template: 'welcome',
      context: { code },
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

    const newCode = this.authenticationRepository.create({ user, code });
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
      // Already verified, return current user data with tiers
      const verifiedUser = await this.userRepository.findOne({
        where: { id: user.id },
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

  async updateUserAlertId(userId: string, token: string): Promise<void> {
    try {
      await this.userRepository.update(userId, { alertID: token });
      console.log('updated');
    } catch (errr) {
      console.log(errr);
    }
  }
}
