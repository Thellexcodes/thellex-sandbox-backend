import { Test, TestingModule } from '@nestjs/testing';
import { DkycService } from './v1/kyc.service';

describe('DkycService', () => {
  let service: DkycService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DkycService],
    }).compile();

    service = module.get<DkycService>(DkycService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
