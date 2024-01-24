import { Test, TestingModule } from '@nestjs/testing';
import { CheckController } from './check.controller';

describe('CheckController', () => {
  let controller: CheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckController],
    }).compile();

    controller = module.get<CheckController>(CheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
