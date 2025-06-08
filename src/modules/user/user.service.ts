import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { JwtPayload } from '@/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { LoginUserDto } from './dto/login-user.dto';
import { MailService } from '../mail/mail.service';
import { VerifyUserDto } from './dto/verify-user.dto';
import { generateUniqueUid } from '@/utils/helpers';
import { UserErrorEnum } from '@/types/user-error.enum';
import { QwalletService } from '../qwallet/qwallet.service';
import { Token } from '@/config/settings';
import { WalletType } from '@/types/wallet-manager.types';

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
  ) {}

  async create(
    createUserDto: CreateUserDto,
    walletType: WalletType,
  ): Promise<string | CustomHttpException> {
    try {
      // Normalize email
      createUserDto.email = createUserDto.email.toLowerCase();

      // Check if user already exists
      let user = await this.findOneByEmail(createUserDto.email);

      if (!user) {
        // Generate unique 8-digit UID
        const uid = await generateUniqueUid(this.userRepository);

        // Create new user instance
        const newUser = new UserEntity();
        newUser.email = createUserDto.email;
        newUser.uid = uid;

        // Save new user to DB
        user = await newUser.save();

        // Only do qwallet subaccount/wallet creation if walletType is qwallet
        if (walletType === WalletType.QWALLET) {
          //creates user qwallet-subaccount
          let qwalletSubAccount =
            await this.qWalletService.lookupSubaccount(user);

          if (!qwalletSubAccount) {
            // Create sub-account if not exists
            const subAccountResponse =
              await this.qWalletService.createSubAccount(
                { email: createUserDto.email },
                user,
              );

            // Create USDT wallet and save it inside createUserWallet method
            await this.qWalletService.createUserWallet(
              subAccountResponse.data.id,
              Token.USDT,
            );

            // Refetch qwalletSubAccount to have updated wallets
            qwalletSubAccount =
              await this.qWalletService.lookupSubaccount(user);
          } else {
            // If sub-account exists, ensure USDT wallet exists
            const usdtWallet = await this.qWalletService.getUserWallet(
              qwalletSubAccount.qid,
              Token.USDT,
            );

            if (!usdtWallet) {
              await this.qWalletService.createUserWallet(
                qwalletSubAccount.qid,
                Token.USDT,
              );
            }
          }
        } else if (walletType === WalletType.CWALLET) {
          //[x] work on cwallet integration for user
        }
      }

      // Trigger email verification flow
      await this.emailVerificationComposer(user);

      // Generate auth token for the user
      const token = await this.signToken({ id: user.id });

      return token;
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        error.message,
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
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.devices', 'devices')
        .leftJoinAndSelect('user.qwallet', 'qwallet')
        .leftJoinAndSelect('user.electronic_cards', 'electronic_cards')
        .leftJoinAndSelect('user.dkyc', 'dkyc')
        .leftJoinAndSelect('user.notifications', 'notifications')
        .leftJoinAndSelect('user.transactionHistory', 'transactionHistory')
        .getOne();

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
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.devices', 'devices')
        .leftJoinAndSelect('user.qwallet', 'qwallet')
        .leftJoinAndSelect('user.electronic_cards', 'electronic_cards')
        .leftJoinAndSelect('user.dkyc', 'dkyc')
        .leftJoinAndSelect('user.notifications', 'notifications')
        .leftJoinAndSelect('user.transactionHistory', 'transactionHistory')
        .where('user.id = :id', { id })
        .getOne();

      return user;
    } catch (err) {
      console.log(err);
    }
  }

  async verifyUser(
    verifyUserDto: VerifyUserDto,
    user: UserEntity,
  ): Promise<boolean> {
    const auth = await this.authenticationRepository.findOne({
      where: {
        code: verifyUserDto.code,
        user: { id: user.id },
      },
    });

    if (!auth || auth.expired)
      throw new Error('Authentication code not found or expired');

    if (auth.code == verifyUserDto.code) {
      auth.expired = true;

      user.emailVerified = true;

      await this.authenticationRepository.save(auth);
      await this.userRepository.save(user);

      return true;
    }

    return false;
  }
}
