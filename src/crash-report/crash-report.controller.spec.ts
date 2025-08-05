import { Test, TestingModule } from '@nestjs/testing';
import { CrashReportController } from './crash-report.controller';
import { CrashReportService } from './crash-report.service';

describe('CrashReportController', () => {
  let controller: CrashReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrashReportController],
      providers: [CrashReportService],
    }).compile();

    controller = module.get<CrashReportController>(CrashReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
