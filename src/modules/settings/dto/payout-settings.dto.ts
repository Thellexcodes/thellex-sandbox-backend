import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// UpdatePayoutSettingsDto
export class UpdatePayoutSettingsDto {
  @ApiPropertyOptional({
    description: 'Payout frequency (e.g., weekly, monthly)',
    example: 'monthly',
  })
  @IsOptional()
  @IsString()
  payoutFrequency?: string;

  @ApiPropertyOptional({
    description: 'Payout day of the week or month',
    example: 'Friday',
  })
  @IsOptional()
  @IsString()
  payoutDay?: string;
}
