import { Test, TestingModule } from '@nestjs/testing';
import { IntelligenceService } from './intelligence.service';

describe('IntelligenceService', () => {
  let service: IntelligenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntelligenceService],
    }).compile();

    service = module.get<IntelligenceService>(IntelligenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
