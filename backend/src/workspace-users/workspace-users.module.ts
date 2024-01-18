import { Module } from '@nestjs/common';
import { WorkspaceUsersController } from './workspace-users.controller';
import { WorkspaceUsersService } from './workspace-users.service';

@Module({
  controllers: [WorkspaceUsersController],
  providers: [WorkspaceUsersService]
})
export class WorkspaceUsersModule {}
