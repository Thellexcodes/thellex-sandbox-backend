import { Test, TestingModule } from '@nestjs/testing';
import { WalletManagerController } from './wallet-manager.controller';
import { WalletManagerService } from './wallet-manager.service';

describe('WalletManagerController', () => {
  let controller: WalletManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletManagerController],
      providers: [WalletManagerService],
    }).compile();

    controller = module.get<WalletManagerController>(WalletManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
