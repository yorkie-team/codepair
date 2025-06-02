package users

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

// Handler handles HTTP requests for users services.
type Handler struct {
	userRepository Repository
}

func (h *Handler) findUser(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	user, err := h.userRepository.FindUser(entity.ID(payload.Subject))
	if err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return UserNotFoundError
		}
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.JSON(http.StatusOK, models.FindUserResponse{
		Id:       string(user.ID),
		Nickname: user.Nickname,
		//TODO(window9u): Add this after workspace implemented
		LastWorkspaceSlug: "",
		CreatedAt:         user.CreatedAt,
		UpdatedAt:         user.UpdatedAt,
	})
}

func (h *Handler) changeNickname(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	req := &models.ChangeNicknameRequest{}
	if err = c.Bind(req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	if err = h.userRepository.UpdateNickname(entity.ID(payload.Subject), req.Nickname); err != nil {
		if errors.Is(err, database.ErrNicknameConflict) {
			return NicknameConflictError
		}

		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.NoContent(http.StatusOK)
}
