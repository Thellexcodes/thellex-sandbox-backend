import { Test, TestingModule } from '@nestjs/testing';
import { VersionGateway } from './version.gateway';
import { VersionService } from './version.service';

describe('VersionGateway', () => {
  let gateway: VersionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VersionGateway, VersionService],
    }).compile();

    gateway = module.get<VersionGateway>(VersionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
