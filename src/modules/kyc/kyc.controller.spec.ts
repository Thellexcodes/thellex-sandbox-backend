import { Test, TestingModule } from '@nestjs/testing';
import { DkycController } from './v1/kyc.controller';
import { DkycService } from './v1/kyc.service';

describe('DkycController', () => {
  let controller: DkycController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DkycController],
      providers: [DkycService],
    }).compile();

    controller = module.get<DkycController>(DkycController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
