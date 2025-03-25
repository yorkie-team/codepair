package users

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
	"net/http"
)

// Handler handles HTTP requests for hello messages.
type Handler struct {
	service *Service
}

func (h *Handler) FindUser(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	user, err := h.service.FindUser(payload.ID)
	if err != nil {
		return err
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

func (h *Handler) ChangeNickname(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	req := &models.ChangeNicknameRequest{}
	if err = c.Bind(req); err != nil {
		return middleware.NewError(http.StatusInternalServerError, err.Error())
	}

	if err = h.service.ChangeNickname(payload.ID, req.Nickname); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}
