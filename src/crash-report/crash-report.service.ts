import { Injectable, Logger } from '@nestjs/common';
import { CreateCrashReportDto } from './dto/create-crash-report.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CrashReportService {
  private readonly logger = new Logger(CrashReportService.name);
  private crashDir = path.resolve(__dirname, '..', '..', 'crash_logs');

  constructor() {
    if (!fs.existsSync(this.crashDir)) {
      fs.mkdirSync(this.crashDir, { recursive: true });
    }
  }

  async create(createCrashReportDto: CreateCrashReportDto) {
    const date = new Date(createCrashReportDto.timestamp);
    const dateFolder = path.join(
      this.crashDir,
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
        .getDate()
        .toString()
        .padStart(2, '0')}`,
    );

    if (!fs.existsSync(dateFolder)) {
      fs.mkdirSync(dateFolder, { recursive: true });
    }

    const filename = `${createCrashReportDto.device.replace(/\s+/g, '_')}_${createCrashReportDto.timestamp}.log`;
    const filepath = path.join(dateFolder, filename);

    const content = `Device: ${createCrashReportDto.device}\nOS: ${createCrashReportDto.os}\nTimestamp: ${new Date(createCrashReportDto.timestamp).toISOString()}\n\n${createCrashReportDto.log}`;

    fs.writeFileSync(filepath, content, 'utf8');

    return { success: true };
  }
}
