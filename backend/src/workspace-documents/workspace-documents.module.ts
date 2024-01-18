import { Module } from '@nestjs/common';
import { WorkspaceDocumentsService } from './workspace-documents.service';
import { WorkspaceDocumentsController } from './workspace-documents.controller';

@Module({
  providers: [WorkspaceDocumentsService],
  controllers: [WorkspaceDocumentsController]
})
export class WorkspaceDocumentsModule {}
