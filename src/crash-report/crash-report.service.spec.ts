import { Test, TestingModule } from '@nestjs/testing';
import { CrashReportService } from './crash-report.service';

describe('CrashReportService', () => {
  let service: CrashReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrashReportService],
    }).compile();

    service = module.get<CrashReportService>(CrashReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
