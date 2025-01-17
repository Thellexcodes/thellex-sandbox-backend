import { Test, TestingModule } from '@nestjs/testing';
import { HdwalletController } from './hdwallet.controller';
import { HdwalletService } from './hdwallet.service';

describe('HdwalletController', () => {
  let controller: HdwalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HdwalletController],
      providers: [HdwalletService],
    }).compile();

    controller = module.get<HdwalletController>(HdwalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
