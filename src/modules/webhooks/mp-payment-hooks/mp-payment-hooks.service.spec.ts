import { Test, TestingModule } from '@nestjs/testing';
import { MpPaymentHooksService } from './mp-payment-hooks.service';

describe('MpPaymentHooksService', () => {
  let service: MpPaymentHooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MpPaymentHooksService],
    }).compile();

    service = module.get<MpPaymentHooksService>(MpPaymentHooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
