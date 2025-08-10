import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, ValidateNested } from 'class-validator';
import { PhoneDto } from './phone.dto';
import { Type } from 'class-transformer';

export class VerifyBvnDto {
  @ApiProperty({ description: 'Bank Verification Number (BVN)' })
  @IsNotEmpty({ message: 'bvn/empty' })
  @IsNumberString({}, { message: 'bvn/not-numeric' })
  bvn: string;

  @ApiProperty({
    type: PhoneDto,
    description: 'Phone details including country code and number',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PhoneDto)
  phoneNumber: PhoneDto;
}
