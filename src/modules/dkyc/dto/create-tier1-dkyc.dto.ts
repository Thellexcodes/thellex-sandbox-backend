import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class BasicTierKycDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsOptional()
  @IsString({ message: 'firstName/not-string' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsOptional()
  @IsString({ message: 'middleName/not-string' })
  middlename: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsOptional()
  @IsString({ message: 'lastName/not-string' })
  lastName: string;

  @ApiProperty({ description: 'Date of birth of BVN holder (yyyy-mm-dd)' })
  @IsOptional()
  @IsDateString({}, { message: 'dob/invalid-format' })
  dob: string;

  @ApiProperty({ description: 'Bank Verification Number (BVN)' })
  @IsNotEmpty({ message: 'bvn/empty' })
  @IsNumberString({}, { message: 'bvn/not-numeric' })
  bvn: number;

  @ApiProperty({ description: 'National Identification Number (NIN)' })
  @IsNotEmpty({ message: 'nin/empty' })
  @IsNumberString({}, { message: 'nin/not-numeric' })
  nin: number;
}
