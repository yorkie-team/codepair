package users

import (
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// Service provides business logic for handling hello messages.
type Service struct {
	userRepository Repository
}

func (s *Service) FindUser(id string) (entity.User, error) {
	return s.userRepository.FindUser(entity.ID(id))
}

func (s *Service) ChangeNickname(id, nickname string) error {
	return s.userRepository.UpdateNickname(entity.ID(id), nickname)
}
