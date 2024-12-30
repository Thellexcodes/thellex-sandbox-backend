import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { jwtConfigurations, JwtPayload } from '@/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { LoginUserDto } from './dto/login-user.dto';
import { ERRORS } from '@/utils/types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

      if (userData)
        throw new HttpException(
          'This email is already associated with an account',
          HttpStatus.BAD_REQUEST,
        );

      user = await newUser.save();

      await this.emailVerificationComposer(user);
      const token = await this.signToken({ id: user.id });

      console.log(token);

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

    // const emailOptions = {
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject: 'Verify your account',
    //   context: { code },
    // };

    //[x] await this.mailService.sendEmailVerificationMail(emailOptions);
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
}
