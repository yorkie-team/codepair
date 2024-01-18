import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceDocumentsController } from './workspace-documents.controller';

describe('WorkspaceDocumentsController', () => {
  let controller: WorkspaceDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceDocumentsController],
    }).compile();

    controller = module.get<WorkspaceDocumentsController>(WorkspaceDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
