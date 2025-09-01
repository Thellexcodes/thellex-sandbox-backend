import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateStoreSettingsDto {
  @ApiPropertyOptional({ example: 'My POS Store' })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  storeLogoUrl?: string;

  @ApiPropertyOptional({ example: '#ff9900' })
  @IsOptional()
  @IsString()
  themeColor?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty() @IsString() currency: string;

  @ApiProperty() @IsString() timezone: string;
}

export class UpdateUserPreferencesDto {
  @ApiProperty() @IsString() language: string;
}
