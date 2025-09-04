import { Module } from '@nestjs/common';
import { CrashReportService } from './crash-report.service';
import { CrashReportController } from './crash-report.controller';

@Module({
  controllers: [CrashReportController],
  providers: [CrashReportService],
})
export class CrashReportModule {}
