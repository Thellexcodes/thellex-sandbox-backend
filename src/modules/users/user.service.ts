import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { IUserDto, UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { JwtPayload } from '@/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { LoginUserDto } from './dto/login-user.dto';
import { MailService } from '../email/mail.service';
import { VerifyUserDto } from './dto/verify-user.dto';
import { formatTier, generateUniqueUid } from '@/utils/helpers';
import { UserErrorEnum } from '@/models/user-error.enum';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { TierEnum, tierOrder } from '@/config/tier.lists';
import { plainToInstance } from 'class-transformer';
import { CwalletsEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet.entity';

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
  ) {}

  private formatUserWithTiers(user: UserEntity) {
    const userTier = user.tier || TierEnum.NONE;
    const currentIndex = tierOrder.indexOf(userTier);
    const nextTier =
      currentIndex + 1 < tierOrder.length ? tierOrder[currentIndex + 1] : null;

    return {
      ...user,
      currentTier: formatTier(userTier),
      nextTier: nextTier ? formatTier(nextTier) : null,
    };
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    try {
      const email = createUserDto.email.toLowerCase();
      let user = await this.findOneByEmail(email);

      if (user) {
        await this.emailVerificationComposer(user);
        const access_token = await this.signToken({ id: user.id });
        return { access_token };
      }

      const uid = await generateUniqueUid(this.userRepository);
      const newUser = this.userRepository.create({
        email,
        uid,
      });

      user = await this.userRepository.save(newUser);

      await this.emailVerificationComposer(user);
      const access_token = await this.signToken({ id: user.id });
      return { access_token };
    } catch (error: any) {
      this.logger.error('User creation failed:', error);
      throw new CustomHttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

    const userPlain = this.formatUserWithTiers(user);

    console.log(userPlain);

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

  async emailVerificationComposer(user: UserEntity): Promise<void> {
    const code = await this.generateAuthVerificationCode('email', user);

    const emailOptions = {
      to: user.email,
      from: this.configService.get<string>('GMAIL_USER'),
      subject: 'Verify your account',
      template: 'welcome',
      context: { code },
    };

    await this.mailService.sendEmail(emailOptions);
  }

  async generateAuthVerificationCode(
    type: 'email' | 'phone',
    user: UserEntity,
  ): Promise<number> {
    let code: number;
    let exists: Boolean | AuthVerificationCodesEntity = true;

    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000);
      exists = await this.authenticationRepository.findOne({ where: { code } });
    }

    const newCode = this.authenticationRepository.create({ user, code });
    await this.authenticationRepository.save(newCode);

    return code;
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

      const userPlain = this.formatUserWithTiers(verifiedUser);
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

    const userPlain = this.formatUserWithTiers(updatedUser);

    console.log(userPlain);

    return plainToInstance(IUserDto, userPlain, {
      excludeExtraneousValues: true,
    });
  }

  async updateUserTier(userId: string, newTier: TierEnum): Promise<void> {
    await this.userRepository.update(userId, { tier: newTier });
  }
}
