import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

// UpdateTaxSettingsDto
export class UpdateTaxSettingsDto {
  @ApiPropertyOptional({ description: 'Tax rate as percentage', example: 10.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Whether tax is inclusive',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isTaxInclusive?: boolean;
}
