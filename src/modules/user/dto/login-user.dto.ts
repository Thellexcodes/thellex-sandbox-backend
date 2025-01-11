import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'email/phone' })
  @IsNotEmpty({ message: 'identifier/empty' })
  @IsString({ message: 'identifier/not-string' })
  identifier: string;

  @IsOptional()
  @ApiProperty()
  @MinLength(6, { message: 'password/short' })
  password: string;
}

export class TokenLoginUserDto {
  @IsNotEmpty({ message: 'identifier/empty' })
  @IsString({ message: 'identifier/not-string' })
  token: string;
}
