import { Test, TestingModule } from '@nestjs/testing';
import { IntelligenceController } from './intelligence.controller';

describe('IntelligenceController', () => {
  let controller: IntelligenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntelligenceController],
    }).compile();

    controller = module.get<IntelligenceController>(IntelligenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
