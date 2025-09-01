import { Test, TestingModule } from '@nestjs/testing';
import { BridgeController } from './bridge.controller';
import { BridgeService } from './bridge.service';

describe('BridgeController', () => {
  let controller: BridgeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BridgeController],
      providers: [BridgeService],
    }).compile();

    controller = module.get<BridgeController>(BridgeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
