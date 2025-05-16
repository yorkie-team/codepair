package files

import (
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// Repository defines methods for workspace access.
type Repository interface {
    FindWorkspaceByID(id entity.ID) (entity.Workspace, error)
}
