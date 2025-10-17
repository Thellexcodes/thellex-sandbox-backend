import { TierEnum } from '@/config/tier.lists';
import { TransportTypes } from '@/models/email-types';
import { MailService } from '@/modules/email/mail.service';
import { CwalletService } from '@/modules/wallets/cwallet/cwallet.service';
import { QwalletService } from '@/modules/wallets/qwallet/qwallet.service';
import { BaseFindArgs, FindManyArgs } from '@/utils/DynamicSource';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { FiatwalletService } from '@/modules/wallets/fiatwallet/fiatwallet.service';
import { UserService } from '../v1/user.service';
import {
  IUserDto,
  UserEntity,
} from '@/utils/typeorm/entities/user/user.entity';

@Injectable()
export abstract class AbstractUserService {
  protected readonly logger = new Logger(AbstractUserService.name);

  constructor(
    protected readonly userRepository: Repository<UserEntity>,
    protected readonly authenticationRepository: Repository<AuthVerificationCodesEntity>,
    protected readonly userServiceV1: UserService,
    protected readonly jwtService: JwtService,
    protected readonly mailService: MailService,
    protected readonly qwalletService: QwalletService,
    protected readonly cwalletService: CwalletService,
    protected readonly fiatWalletService: FiatwalletService,
    protected readonly dataSource: DataSource,
  ) {}

  /** Create a new user or return existing one with token */
  abstract create(
    createUserDto: any,
  ): Promise<{ access_token: string; expires_at?: Date }>;

  /** Resend email verification code for existing user */
  protected abstract resendVerification(user: UserEntity): Promise<Date>;

  /** Authenticate login and return user DTO */
  abstract authenticateLogin(user: UserEntity): Promise<IUserDto>;

  /** Verify user with email code */
  abstract verifyUser(verifyUserDto: any, user: UserEntity): Promise<IUserDto>;

  /** Update user tier */
  abstract updateUserTier(userId: string, newTier: TierEnum): Promise<void>;

  /** Generate JWT token */
  protected abstract signToken(payload: any): Promise<string>;

  /** Compose and send verification email */
  protected abstract emailVerificationComposer(
    user: UserEntity,
    fromType?: TransportTypes,
  ): Promise<{ expires_at: Date }>;

  /** Generate a unique verification code */
  protected abstract generateAuthVerificationCode(
    type: 'email' | 'phone',
    user: UserEntity,
  ): Promise<{ code: number; expires_at: Date }>;

  protected abstract setUserPin(userId: string, pin: string): Promise<boolean>;
}
