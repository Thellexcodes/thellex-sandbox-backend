import { Test, TestingModule } from '@nestjs/testing';
import { FiatYellowcardService } from './fiat-yellowcard.service';

describe('FiatYellowcardService', () => {
  let service: FiatYellowcardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FiatYellowcardService],
    }).compile();

    service = module.get<FiatYellowcardService>(FiatYellowcardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
