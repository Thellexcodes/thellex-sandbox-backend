import { Test, TestingModule } from '@nestjs/testing';
import { FiatYellowcardController } from './fiat-yellowcard.controller';
import { FiatYellowcardService } from './fiat-yellowcard.service';

describe('FiatYellowcardController', () => {
  let controller: FiatYellowcardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiatYellowcardController],
      providers: [FiatYellowcardService],
    }).compile();

    controller = module.get<FiatYellowcardController>(FiatYellowcardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
