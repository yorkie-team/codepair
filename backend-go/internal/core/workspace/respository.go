package workspace

import (
	"time"

	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

type Repository interface {
	FindWorkspaceByID(workspaceID string) (entity.Workspace, error)
	FindWorkspaceBySlug(userID, slug string) (entity.Workspace, error)
	FindWorkspacesOfUser(userID, cursor string, pageSize int) ([]entity.Workspace, error)
	CreateWorkspace(userID, title string) (entity.Workspace, error)
	CreateInvitationToken(userID, workspaceID string, expiredAt time.Time) (entity.WorkspaceInvitation, error)
	JoinWorkspace(userID, token string) error
}
