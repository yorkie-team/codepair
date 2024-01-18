import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceUsersController } from './workspace-users.controller';

describe('WorkspaceUsersController', () => {
  let controller: WorkspaceUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUsersController],
    }).compile();

    controller = module.get<WorkspaceUsersController>(WorkspaceUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
