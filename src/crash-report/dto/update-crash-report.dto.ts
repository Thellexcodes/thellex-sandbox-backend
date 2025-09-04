import { PartialType } from '@nestjs/swagger';
import { CreateCrashReportDto } from './create-crash-report.dto';

export class UpdateCrashReportDto extends PartialType(CreateCrashReportDto) {}
