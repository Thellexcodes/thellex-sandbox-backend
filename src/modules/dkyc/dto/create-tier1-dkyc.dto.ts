import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class BvnkycDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsOptional()
  @IsString({ message: 'firstName/not-string' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsOptional()
  @IsString({ message: 'lastName/not-string' })
  lastName: string;

  @ApiProperty({ description: 'Bank Verification Number (BVN)' })
  @IsNotEmpty({ message: 'bvn/empty' })
  @IsNumberString({}, { message: 'bvn/not-numeric' })
  bvn: string;

  @ApiProperty({ description: 'Date of birth of BVN holder (yyyy-mm-dd)' })
  @IsOptional()
  @IsDateString({}, { message: 'dob/invalid-format' })
  dob: string;
}

export class NinkycDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsOptional()
  @IsString({ message: 'firstName/not-string' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsOptional()
  @IsString({ message: 'lastName/not-string' })
  lastName: string;

  // @ApiProperty({ description: 'Bank Verification Number (BVN)' })
  // @IsNotEmpty({ message: 'bvn/empty' })
  // @IsNumberString({}, { message: 'bvn/not-numeric' })
  // nin: string;

  // @ApiProperty({ description: 'Date of birth of BVN holder (yyyy-mm-dd)' })
  // @IsOptional()
  // @IsDateString({}, { message: 'dob/invalid-format' })
  // dob: string;
}
