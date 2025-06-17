package workspace

import (
	"context"
	"time"

	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

type Repository interface {
	FindWorkspaceByID(ctx context.Context, workspaceID string) (entity.Workspace, error)
	FindWorkspaceBySlug(ctx context.Context, userID, slug string) (entity.Workspace, error)
	FindWorkspacesOfUser(ctx context.Context, userID, cursor string, pageSize int) ([]entity.Workspace, error)
	CreateWorkspace(ctx context.Context, userID, title string) (entity.Workspace, error)
	CreateInvitationToken(
		ctx context.Context,
		userID, workspaceID string,
		expiredAt time.Time,
	) (entity.WorkspaceInvitation, error)
	JoinWorkspace(ctx context.Context, userID, token string) error
}
