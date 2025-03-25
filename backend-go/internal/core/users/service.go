package users

import (
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// Service provides business logic for handling hello messages.
type Service struct {
	userRepository Repository
}

// findUser retrieves a user by their ID.
func (s *Service) findUser(id string) (entity.User, error) {
	return s.userRepository.FindUser(entity.ID(id))
}

// changeNickname updates the nickname of a user.
func (s *Service) changeNickname(id, nickname string) error {
	return s.userRepository.UpdateNickname(entity.ID(id), nickname)
}
