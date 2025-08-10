import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class PhoneDto {
  @ApiProperty({
    example: '+234',
    description: 'Phone country code (e.g. +234)',
  })
  @IsString()
  @Matches(/^\+\d{1,4}$/, { message: 'phone_country_code/invalid-format' })
  phone_country_code: string;

  @ApiProperty({
    example: '8135878103',
    description: 'Phone number without country code',
  })
  @IsString()
  @Matches(/^\d{6,15}$/, { message: 'phone_number/invalid-format' })
  phone_number: string;

  get fullPhone(): string {
    return `${this.phone_country_code}${this.phone_number}`;
  }
}
