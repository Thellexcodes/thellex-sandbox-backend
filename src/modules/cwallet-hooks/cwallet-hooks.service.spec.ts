import { Test, TestingModule } from '@nestjs/testing';
import { CwalletHooksService } from './cwallet-hooks.service';

describe('CwalletHooksService', () => {
  let service: CwalletHooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CwalletHooksService],
    }).compile();

    service = module.get<CwalletHooksService>(CwalletHooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
