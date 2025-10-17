import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractUserService } from '../abstracts/abstract.userService';
import { TierEnum } from '@/config/tier.lists';
import { TransportTypes } from '@/models/email-types';
import {
  BaseFindArgs,
  dynamicQuery,
  findOneDynamic,
} from '@/utils/DynamicSource';
import { VerifyUserDto } from '../dto/verify-user.dto';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { UserErrorEnum } from '@/models/user-error.enum';
import { formatUserWithTiers } from '@/utils/helpers';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/modules/email/mail.service';
import { QwalletService } from '@/modules/wallets/qwallet/qwallet.service';
import { CwalletService } from '@/modules/wallets/cwallet/cwallet.service';
import { FiatwalletService } from '@/modules/wallets/fiatwallet/fiatwallet.service';
import { UserService } from '../v1/user.service';
import * as bcrypt from 'bcrypt';
import {
  IUserDto,
  UserEntity,
} from '@/utils/typeorm/entities/user/user.entity';

@Injectable()
export class UserServiceV2 extends AbstractUserService {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,

    @InjectRepository(AuthVerificationCodesEntity)
    protected readonly authenticationRepository: Repository<AuthVerificationCodesEntity>,

    protected readonly dataSource: DataSource,

    protected readonly jwtService: JwtService,
    protected readonly mailService: MailService,
    protected readonly userServiceV1: UserService,
    protected readonly cwalletService: CwalletService,
    protected readonly qwalletService: QwalletService,
    protected readonly fiatWalletService: FiatwalletService,
  ) {
    super(
      userRepository,
      authenticationRepository,
      userServiceV1,
      jwtService,
      mailService,
      qwalletService,
      cwalletService,
      fiatWalletService,
      dataSource,
    );
  }

  create(
    createUserDto: any,
  ): Promise<{ access_token: string; expires_at?: Date }> {
    throw new Error('Method not implemented.');
  }
  protected resendVerification(user: UserEntity): Promise<Date> {
    throw new Error('Method not implemented.');
  }
  authenticateLogin(user: UserEntity): Promise<IUserDto> {
    throw new Error('Method not implemented.');
  }

  async verifyUser(
    verifyUserDto: VerifyUserDto,
    user: UserEntity,
  ): Promise<IUserDto> {
    const { code } = verifyUserDto;

    const options = dynamicQuery<AuthVerificationCodesEntity>('findOne', {
      code: `${code}`,
      user: user.id,
      fields: 'code,expired',
    } as BaseFindArgs);

    const auth = await findOneDynamic(this.authenticationRepository, options);

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
      let vUser = await this.userServiceV1.findOne({
        id: user.id,
        fields: 'email,id,role,tier,uid,emailVerified',
      });

      if (!vUser)
        throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);

      const userPlain = formatUserWithTiers(vUser);
      return plainToInstance(IUserDto, userPlain, {
        excludeExtraneousValues: true,
      });
    }

    // First-time verification flow
    user.emailVerified = true;
    auth.expired = true;
    auth.user = user;

    await Promise.all([
      this.userRepository.save(user),
      this.authenticationRepository.save(auth),
      this.qwalletService.ensureUserHasProfileAndWallets(user),
      this.cwalletService.ensureUserHasProfileAndWallets(user),
      this.fiatWalletService.createProfileWithWallet(user.id),
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

  updateUserTier(userId: string, newTier: TierEnum): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected signToken(payload: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  protected emailVerificationComposer(
    user: UserEntity,
    fromType?: TransportTypes,
  ): Promise<{ expires_at: Date }> {
    throw new Error('Method not implemented.');
  }
  protected generateAuthVerificationCode(
    type: 'email' | 'phone',
    user: UserEntity,
  ): Promise<{ code: number; expires_at: Date }> {
    throw new Error('Method not implemented.');
  }

  protected async setUserPin(userId: string, pin: string): Promise<boolean> {
    // const hashed = await bcrypt.hash(pin, 10);
    // let userSec = await this.userSecurityRepo.findOne({
    //   where: { user: { id: userId } },
    // });

    // if (!userSec) {
    //   userSec = this.userSecurityRepo.create({
    //     user: { id: userId },
    //     hasPin: true,
    //     pinHash: hashed,
    //   });
    // } else {
    //   userSec.hasPin = true;
    //   userSec.pinHash = hashed;
    // }

    return true;
  }
}
