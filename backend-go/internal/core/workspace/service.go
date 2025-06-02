package workspace

import (
	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
)

type Service struct {
	workspaceRepository Repository
}

func (s *Service) createWorkspace(userID, title string) error {

	return nil
}

func (s *Service) findWorkspaces(userID, page, cursor string) (models.FindWorkspacesResponse, error) {
	return nil
}
