import { IsBoolean, IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class CheckAppVersionDto {
  @IsString()
  @IsIn(['android', 'ios'], {
    message: 'Platform must be either "android" or "ios"',
  })
  platform: 'android' | 'ios' = 'android';

  @IsString()
  currentVersion!: string;
}

export class PlatformVersionDto {
  @IsString()
  latestVersion!: string;

  @IsString()
  minSupportedVersion!: string;

  @IsString()
  updateType!: 'major' | 'minor' | 'patch';

  @IsBoolean()
  forceUpdate!: boolean;

  @IsOptional()
  @IsUrl()
  downloadUrl?: string;

  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @IsBoolean()
  majorUpdate!: boolean;
}

export class AppVersionDto {
  android?: PlatformVersionDto[];
  ios?: PlatformVersionDto[];
}
