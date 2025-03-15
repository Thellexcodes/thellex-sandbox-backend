import { Test, TestingModule } from '@nestjs/testing';
import { CardManagementService } from './card-management.service';

describe('CardManagementService', () => {
  let service: CardManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardManagementService],
    }).compile();

    service = module.get<CardManagementService>(CardManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
