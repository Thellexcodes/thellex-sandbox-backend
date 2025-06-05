import { Test, TestingModule } from '@nestjs/testing';
import { QwalletHooksService } from './qwallet-hooks.service';

describe('QwalletHooksService', () => {
  let service: QwalletHooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QwalletHooksService],
    }).compile();

    service = module.get<QwalletHooksService>(QwalletHooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
