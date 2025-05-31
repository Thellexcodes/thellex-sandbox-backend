import { Test, TestingModule } from '@nestjs/testing';
import { QwalletService } from './qwallet.service';

describe('QwalletService', () => {
  let service: QwalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QwalletService],
    }).compile();

    service = module.get<QwalletService>(QwalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
