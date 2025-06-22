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
import { generateUniqueUid } from '@/utils/helpers';
import { UserErrorEnum } from '@/models/user-error.enum';
import { SupportedBlockchainType } from '@/config/settings';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { TierEnum } from '@/constants/tier.lists';
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
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    try {
      const email = createUserDto.email.toLowerCase();
      let user = await this.findOneByEmail(email);

      if (user) {
        // Resend verification email (optional)
        await this.emailVerificationComposer(user);

        // Existing user — return token only
        const access_token = await this.signToken({ id: user.id });
        return { access_token };
      }

      const uid = await generateUniqueUid(this.userRepository);
      const newUser = new UserEntity();
      newUser.email = email;
      newUser.uid = uid;
      user = await newUser.save();

      // Send verification email once
      await this.emailVerificationComposer(user);

      await this.qwalletService.ensureUserHasProfileAndWallets(user);
      // await this.cwalletService.ensureUserHasProfileAndWallets(user);

      // Return token
      const access_token = await this.signToken({ id: user.id });
      return { access_token };
    } catch (error: any) {
      console.error('User creation failed:', error);
      throw new CustomHttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginUserDto: LoginUserDto) {
    let user: UserEntity;
    const identifier = loginUserDto.identifier.trim().toLocaleLowerCase();

    user = await this.findOneByEmail(identifier);

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

    const token = await this.signToken({ id: user.id });

    return { token, isAuthenticated: true };
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
      return user;
    } catch (err) {
      //TODO: HANDLE ERRORS
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
    let exists: any = true;

    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000);

      exists = await AuthVerificationCodesEntity.findOne({
        where: { code },
      });
    }

    const newCode = new AuthVerificationCodesEntity();
    newCode.user = user;
    newCode.code = code;

    await newCode.save();

    return code;
  }

  async signToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async findOneById(id: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      return user;
    } catch (err) {
      console.log(err);
    }
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

    // If already verified, return transformed result directly
    if (user.emailVerified) {
      const verifiedUser = await this.userRepository.findOne({
        where: { id: user.id },
        relations: [
          'qWalletProfile',
          'qWalletProfile.wallets',
          'qWalletProfile.wallets.tokens',
          'cWalletProfile',
          'cWalletProfile.wallets',
          'cWalletProfile.wallets.tokens',
        ],
      });

      return plainToInstance(IUserDto, verifiedUser, {
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

    const userData = await this.userRepository.findOne({
      where: { id: user.id },
      relations: [
        'qWalletProfile',
        'qWalletProfile.wallets',
        'qWalletProfile.wallets.tokens',
        'cWalletProfile',
        'cWalletProfile.wallets',
        'cWalletProfile.wallets.tokens',
      ],
    });

    const result = plainToInstance(IUserDto, userData, {
      excludeExtraneousValues: true,
    });

    return result;
  }

  async storeTokensForWallet(wallet: CwalletsEntity): Promise<void> {
    // const tokenSymbols =
    //   ChainTokens[wallet.defaultNetwork as SupportedBlockchainType] || [];
    // const tokenEntities = tokenSymbols.map((symbol) => {
    //   const token = new TokenEntity();
    //   token.assetCode = symbol;
    //   token.name = symbol;
    //   token.cwallet = wallet;
    //   return token;
    // });
    // await this.tokenRepo.save(tokenEntities);
  }

  async updateUserTier(userId: string, newTier: TierEnum): Promise<void> {
    await this.userRepository.update(userId, { tier: newTier });
  }
}
