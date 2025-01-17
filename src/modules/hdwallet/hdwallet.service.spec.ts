import { Test, TestingModule } from '@nestjs/testing';
import { HdwalletService } from './hdwallet.service';

describe('HdwalletService', () => {
  let service: HdwalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HdwalletService],
    }).compile();

    service = module.get<HdwalletService>(HdwalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
