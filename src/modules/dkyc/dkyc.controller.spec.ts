import { Test, TestingModule } from '@nestjs/testing';
import { DkycController } from './dkyc.controller';
import { DkycService } from './dkyc.service';

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
