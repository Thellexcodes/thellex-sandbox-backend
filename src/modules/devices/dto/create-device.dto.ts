import { PlatformEnum } from '@/config/settings';
import { IsString, IsNotEmpty, IsEnum, Matches } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsEnum(PlatformEnum)
  @IsNotEmpty()
  platform: PlatformEnum;

  @IsString()
  @IsNotEmpty()
  deviceModel: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d+){0,2}$/, {
    message: 'osVersion must be in a valid format like 13, 14.2, or 10.0.1',
  })
  osVersion: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
