import { Test, TestingModule } from '@nestjs/testing';
import { QwalletHooksController } from './qwallet-hooks.controller';
import { QwalletHooksService } from './qwallet-hooks.service';

describe('QwalletHooksController', () => {
  let controller: QwalletHooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QwalletHooksController],
      providers: [QwalletHooksService],
    }).compile();

    controller = module.get<QwalletHooksController>(QwalletHooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
