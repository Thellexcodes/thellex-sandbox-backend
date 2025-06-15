import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
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
import { generateUniqueUid, normalizeBlockchains } from '@/utils/helpers';
import { UserErrorEnum } from '@/types/user-error.enum';
import { QwalletService } from '../qwallet/qwallet.service';
import {
  ChainTokens,
  QWALLET_TOKENS,
  SUPPORTED_BLOCKCHAINS,
  SupportedBlockchainType,
  TokenEnum,
} from '@/config/settings';
import { CwalletService } from '../cwallet/cwallet.service';

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
    private readonly qWalletService: QwalletService,
    private readonly cWalletService: CwalletService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<string | CustomHttpException> {
    try {
      const email = createUserDto.email.toLowerCase();
      let user = await this.findOneByEmail(email);

      if (user) {
        // Resend verification email (optional)
        await this.emailVerificationComposer(user);

        // Existing user — return token only
        const token = await this.signToken({ id: user.id });
        return token;
      }

      const uid = await generateUniqueUid(this.userRepository);
      const newUser = new UserEntity();
      newUser.email = email;
      newUser.uid = uid;
      user = await newUser.save();

      // ---- QWALLET SETUP ----
      let qwalletSubAccount = await this.qWalletService.lookupSubAccount(user);

      if (!qwalletSubAccount) {
        const subAccountResponse = await this.qWalletService.createSubAccount(
          { email },
          user,
        );
        const subAccountId = subAccountResponse.data.id;

        await Promise.all(
          SUPPORTED_BLOCKCHAINS.flatMap((chain) =>
            ChainTokens[chain]
              .filter((token: TokenEnum) => QWALLET_TOKENS.includes(token))
              .map((token: TokenEnum) =>
                this.qWalletService.createUserWallet(subAccountId, token),
              ),
          ),
        );

        qwalletSubAccount = await this.qWalletService.lookupSubAccount(user);
      } else {
        const subAccountId = qwalletSubAccount.qid;

        await Promise.all(
          SUPPORTED_BLOCKCHAINS.flatMap((chain) =>
            ChainTokens[chain]
              .filter((token: TokenEnum) => QWALLET_TOKENS.includes(token))
              .map(async (token: TokenEnum) => {
                const existingWallet = await this.qWalletService.getUserWallet(
                  subAccountId,
                  token,
                );
                if (!existingWallet) {
                  await this.qWalletService.createUserWallet(
                    subAccountId,
                    token,
                  );
                }
              }),
          ),
        );
      }

      // ---- CWALLET SETUP ----
      const cwalletAccount = await this.cWalletService.lookupSubAccount(user);

      if (!cwalletAccount) {
        const cwalletSets = await this.cWalletService.createWalletSet(user);

        await Promise.all(
          [SupportedBlockchainType.MATIC].map((chain) =>
            this.cWalletService.createWallet(
              cwalletSets.walletSet.id,
              [chain as SupportedBlockchainType],
              user,
            ),
          ),
        );
      }

      // Send verification email once
      await this.emailVerificationComposer(user);

      // Return token
      const token = await this.signToken({ id: user.id });
      return token;
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
  ): Promise<UserEntity> {
    const auth = await this.authenticationRepository.findOne({
      where: {
        code: verifyUserDto.code,
        user: { id: user.id },
      },
    });

    if (!auth || auth.expired) {
      throw new Error('Authentication code not found or expired');
    }

    if (auth.code !== verifyUserDto.code) {
      throw new CustomHttpException(
        UserErrorEnum.REJECTED_AGREEMENT,
        HttpStatus.FORBIDDEN,
      );
    }

    // Mark the authentication code as expired to prevent reuse
    auth.expired = true;

    // Mark the user's email as verified
    user.emailVerified = true;

    // Save changes in parallel to optimize performance
    await Promise.all([
      this.authenticationRepository.save(auth),
      this.userRepository.save(user),
    ]);

    return user;
  }
}
