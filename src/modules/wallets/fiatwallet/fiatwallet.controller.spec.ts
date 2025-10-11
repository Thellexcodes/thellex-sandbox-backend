import { Test, TestingModule } from '@nestjs/testing';
import { FiatwalletController } from './fiatwallet.controller';
import { FiatwalletService } from './fiatwallet.service';

describe('FiatwalletController', () => {
  let controller: FiatwalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiatwalletController],
      providers: [FiatwalletService],
    }).compile();

    controller = module.get<FiatwalletController>(FiatwalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
