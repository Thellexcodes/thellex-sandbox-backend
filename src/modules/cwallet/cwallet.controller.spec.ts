import { Test, TestingModule } from '@nestjs/testing';
import { CwalletController } from './cwallet.controller';
import { CwalletService } from './cwallet.service';

describe('CwalletController', () => {
  let controller: CwalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CwalletController],
      providers: [CwalletService],
    }).compile();

    controller = module.get<CwalletController>(CwalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
