import { Test, TestingModule } from '@nestjs/testing';
import { CwalletService } from './cwallet.service';

describe('CwalletService', () => {
  let service: CwalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CwalletService],
    }).compile();

    service = module.get<CwalletService>(CwalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
