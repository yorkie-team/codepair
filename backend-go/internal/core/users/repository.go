package users

import (
	"context"

	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// Repository defines the interface for CRUD operations on visitor records.
type Repository interface {
	FindUser(ctx context.Context, id entity.ID) (entity.User, error)

	UpdateNickname(ctx context.Context, id entity.ID, nickname string) error

	FindOrCreateUserBySocialID(ctx context.Context, provider, uid string) (entity.ID, error)
}
