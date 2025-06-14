import { Test, TestingModule } from '@nestjs/testing';
import { CwalletHooksController } from './cwallet-hooks.controller';
import { CwalletHooksService } from './cwallet-hooks.service';

describe('CwalletHooksController', () => {
  let controller: CwalletHooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CwalletHooksController],
      providers: [CwalletHooksService],
    }).compile();

    controller = module.get<CwalletHooksController>(CwalletHooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
