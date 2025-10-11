import { Test, TestingModule } from '@nestjs/testing';
import { FiatwalletService } from './fiatwallet.service';

describe('FiatwalletService', () => {
  let service: FiatwalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FiatwalletService],
    }).compile();

    service = module.get<FiatwalletService>(FiatwalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
