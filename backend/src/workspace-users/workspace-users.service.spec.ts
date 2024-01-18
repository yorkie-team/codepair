import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceUsersService } from './workspace-users.service';

describe('WorkspaceUsersService', () => {
  let service: WorkspaceUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceUsersService],
    }).compile();

    service = module.get<WorkspaceUsersService>(WorkspaceUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
