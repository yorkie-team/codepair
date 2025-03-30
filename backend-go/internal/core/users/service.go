package users

import (
	"errors"
	"net/http"

	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

// Service provides business logic for handling hello messages.
type Service struct {
	userRepository Repository
}

// findUser retrieves a user by their ID.
func (s *Service) findUser(id string) (entity.User, error) {
	user, err := s.userRepository.FindUser(entity.ID(id))
	if err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return entity.User{}, UserNotFoundError
		}

		return entity.User{}, middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return user, nil
}

// changeNickname updates the nickname of a user.
func (s *Service) changeNickname(id, nickname string) error {
	if err := s.userRepository.UpdateNickname(entity.ID(id), nickname); err != nil {
		if errors.Is(err, database.ErrNicknameConflict) {
			return NicknameConflictError
		}

		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return nil
}
