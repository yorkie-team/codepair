package workspace

import "github.com/yorkie-team/codepair/backend/internal/infra/database/entity"

type Repository interface {
	FindUserWorkspace(userID, workspaceID string) (entity.UserWorkspace, error)
	FindWorkspaceBySlug(userID, slug string) (entity.Workspace, error)
	FindUserWorkspaces(userID, cursor string, pageSize int) ([]entity.UserWorkspace, error)
	CreateWorkspace(userID, title string) (entity.Workspace, error)
	CreateInvitationToken(userID, workspaceID string) (entity.WorkspaceInvitation, error)
	FindInvitationToken(token string) (entity.WorkspaceInvitation, error)
	CreateUserWorkspace(userID, workspaceID string) (entity.UserWorkspace, error)
}
