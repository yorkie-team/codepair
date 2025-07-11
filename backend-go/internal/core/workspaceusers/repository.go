package workspaceusers

import (
	"context"

	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

type Repository interface {
	FindUserWorkspaceByUserID(ctx context.Context, userID, workspaceID string) (entity.UserWorkspace, error)
	FindUsersByWorkspaceID(ctx context.Context, workspaceID, cursor string, pageSize int) ([]entity.User, error)
	CountUsersByWorkspaceID(ctx context.Context, workspaceID string) (int64, error)
}
