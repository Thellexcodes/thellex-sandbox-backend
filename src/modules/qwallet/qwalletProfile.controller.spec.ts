import { Test, TestingModule } from '@nestjs/testing';
import { QwalletController } from './qwalletProfile.controller';
import { QwalletService } from './qwalletProfile.service';

describe('QwalletController', () => {
  let controller: QwalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QwalletController],
      providers: [QwalletService],
    }).compile();

    controller = module.get<QwalletController>(QwalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
