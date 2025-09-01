import { Test, TestingModule } from '@nestjs/testing';
import { CardManagementController } from './card-management.controller';
import { CardManagementService } from './card-management.service';

describe('CardManagementController', () => {
  let controller: CardManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardManagementController],
      providers: [CardManagementService],
    }).compile();

    controller = module.get<CardManagementController>(CardManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
