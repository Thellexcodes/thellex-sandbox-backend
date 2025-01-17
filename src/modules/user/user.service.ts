import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
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
import { ERRORS } from '@/utils/types';
import { MailService } from '../mail/mail.service';
import { VerifyUserDto } from './dto/verify-user.dto';

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
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<string | CustomHttpException> {
    try {
      let user: UserEntity;
      const userData = await this.findOneByEmail(createUserDto.email);
      createUserDto.email = createUserDto.email.toLowerCase();
      const newUser = new UserEntity();
      newUser.email = createUserDto.email.toLowerCase();

      if (!userData) {
        user = await newUser.save();
      } else {
        user = userData;
      }

      await this.emailVerificationComposer(user);
      const token = await this.signToken({ id: user.id });

      return token;
    } catch (error) {
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
        ERRORS.INVALID_CREDENTIAL,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!user.emailVerified) {
      throw new CustomHttpException(
        ERRORS.EMAIL_NOT_VERIFIED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = await this.signToken({ id: user.id });

    return { token, isAuthenticated: true };
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();

    return user;
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
  ) {
    const code = Math.floor(100000 + Math.random() * 9000);
    const newCode = new AuthVerificationCodesEntity();
    newCode.user = user;

    if (type === 'email') {
      newCode.code = code;
    }

    newCode.save();

    return code;
  }

  async signToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async findOneById(id: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.devices', 'device')
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
