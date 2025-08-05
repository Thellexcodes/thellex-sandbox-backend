import { Test, TestingModule } from '@nestjs/testing';
import { MpPaymentHooksController } from './mp-payment-hooks.controller';
import { MpPaymentHooksService } from './mp-payment-hooks.service';

describe('MpPaymentHooksController', () => {
  let controller: MpPaymentHooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MpPaymentHooksController],
      providers: [MpPaymentHooksService],
    }).compile();

    controller = module.get<MpPaymentHooksController>(MpPaymentHooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
