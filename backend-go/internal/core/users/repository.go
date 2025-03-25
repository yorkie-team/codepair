package users

import "github.com/yorkie-team/codepair/backend/internal/infra/database/entity"

// Repository defines the interface for CRUD operations on visitor records.
type Repository interface {
	FindUser(id entity.ID) (entity.User, error)

	UpdateNickname(id entity.ID, nickname string) error
}
